import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) { }

  /**
   * Asegura que cada servicio tenga la extensión .png o .svg si es un icono local.
   * Adaptado para soportar los iconos dentales del negocio de Rosita.
   * Se aplica tanto a servicios generales como a tipos de cita (booking).
   */
  private normalizarIconos(items: any[]): any[] {
    if (!Array.isArray(items)) return [];

    return items.map(item => {
      if (item.icono && !item.icono.includes('.') && !item.icono.startsWith('data:')) {
        return { ...item, icono: `${item.icono}.png` };
      }
      return item;
    });
  }

  /**
   * CREAR: Crea un negocio validando que el slug sea único.
   */
  async create(createBusinessDto: CreateBusinessDto) {
    const existing = await this.prisma.business.findUnique({
      where: { slug: createBusinessDto.slug },
    });

    if (existing) {
      throw new ConflictException('El slug (URL personalizada) ya está en uso');
    }

    const { servicios, reviews, seccion_que_hacemos, booking_services, ...rest } = createBusinessDto;

    const serviciosNormalizados = this.normalizarIconos(servicios as any[]);
    const bookingNormalizados = this.normalizarIconos(booking_services as any[]);

    return this.prisma.business.create({
      data: {
        ...rest,
        servicios: serviciosNormalizados as unknown as Prisma.InputJsonValue,
        booking_services: bookingNormalizados as unknown as Prisma.InputJsonValue,
        reviews: reviews as unknown as Prisma.InputJsonValue,
        seccion_que_hacemos: seccion_que_hacemos as unknown as Prisma.InputJsonValue,
        creado_en: new Date(),
        actualizado_en: new Date(),
      },
    });
  }

  /**
   * LISTAR TODOS: Utilizado por la Consola TECHSOFT.
   */
  async findAll() {
    return this.prisma.business.findMany({
      orderBy: { creado_en: 'desc' },
      include: {
        usuarios: {
          select: {
            id: true,
            email: true,
            nombres: true,
            apellidos: true,
            rol: true
          }
        },
        _count: {
          select: { professionals: true, usuarios: true }
        }
      }
    });
  }

  /**
   * BUSCAR POR ID: Detalle individual para el Dashboard Admin (Rosita) o TechSoft.
   */
  async findOne(id: string | null) {
    if (!id) throw new UnauthorizedException('Negocio requerido.');

    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        usuarios: true,
        _count: {
          select: { usuarios: true, citas: true, professionals: true }
        }
      }
    });

    if (!business) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado`);
    }
    return business;
  }

  /**
   * BUSCAR POR SLUG: Vital para cargar la landing pública.
   */
  async findBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      include: {
        professionals: {
          orderBy: { orden: 'asc' }
        }
      }
    });

    if (!business) {
      throw new NotFoundException(`No existe ningún negocio con la URL: ${slug}`);
    }
    return business;
  }

  /**
   * ACTUALIZAR: Persiste cambios. Gestiona booking_services de forma dinámica.
   */
  async update(id: string | null, updateBusinessDto: UpdateBusinessDto) {
    if (!id) throw new UnauthorizedException('Negocio requerido.');

    // Verificamos que el negocio exista
    await this.findOne(id);

    const { servicios, reviews, config_visual, seccion_que_hacemos, booking_services, ...rest } = updateBusinessDto;

    const updateData: any = {
      ...rest,
      actualizado_en: new Date(),
    };

    if (servicios !== undefined) {
      updateData.servicios = this.normalizarIconos(servicios as any[]) as unknown as Prisma.InputJsonValue;
    }

    if (booking_services !== undefined) {
      updateData.booking_services = this.normalizarIconos(booking_services as any[]) as unknown as Prisma.InputJsonValue;
    }

    if (reviews !== undefined) {
      updateData.reviews = reviews as unknown as Prisma.InputJsonValue;
    }

    if (config_visual !== undefined) {
      updateData.config_visual = config_visual as unknown as Prisma.InputJsonValue;
    }

    if (seccion_que_hacemos !== undefined) {
      updateData.seccion_que_hacemos = seccion_que_hacemos as unknown as Prisma.InputJsonValue;
    }

    try {
      return await this.prisma.business.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      console.error('Error al actualizar en Prisma:', error);
      throw error;
    }
  }

  /**
   * ELIMINAR: Borrado físico del negocio.
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.business.delete({
      where: { id },
    });
  }
}

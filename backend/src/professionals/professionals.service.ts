import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../auth/auth.types';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) { }

  async create(createProfessionalDto: CreateProfessionalDto, actor?: AuthUser) {
    const businessId = actor?.rol === 'TECHSOFT' ? createProfessionalDto.business_id : actor?.business_id;
    if (!businessId) throw new UnauthorizedException('No se pudo resolver el negocio del profesional.');

    const existingUser = await this.prisma.usuarios.findUnique({
      where: { email: createProfessionalDto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario registrado con este email.');
    }

    const hashedPassword = await bcrypt.hash(createProfessionalDto.password_hash, 10);

    return this.prisma.$transaction(async (tx) => {
      const usuarioDoctor = await tx.usuarios.create({
        data: {
          email: createProfessionalDto.email,
          password_hash: hashedPassword,
          rol: 'DOCTOR',
          nombres: createProfessionalDto.nombre,
          apellidos: '',
          business_id: businessId,
          telefono: createProfessionalDto.telefono || null,
          movil1: createProfessionalDto.movil1 || null,
          direccion: createProfessionalDto.direccion || null,
        }
      });

      await tx.perfil_doctor.create({
        data: {
          usuario_id: usuarioDoctor.id,
          numero_colegiado: createProfessionalDto.numero_colegiado || `PENDIENTE-${usuarioDoctor.id}`,
          especialidad_primaria: createProfessionalDto.especialidad_primaria || 'GENERAL',
          universidad_egreso: createProfessionalDto.universidad_egreso || null,
          anos_experiencia: createProfessionalDto.anos_experiencia || null,
          biografia: createProfessionalDto.descripcion || null
        }
      });

      return tx.professional.create({
        data: {
          usuario_id: usuarioDoctor.id,
          nombre: createProfessionalDto.nombre,
          cargo: createProfessionalDto.cargo,
          formacion: createProfessionalDto.formacion,
          descripcion: createProfessionalDto.descripcion,
          foto_url: createProfessionalDto.foto_url,
          orden: createProfessionalDto.orden || 0,
          linkedin_url: createProfessionalDto.linkedin_url,
          instagram_url: createProfessionalDto.instagram_url,
          business_id: businessId,
        }
      });
    });
  }

  async findAllByBusiness(businessId: string) {
    return this.prisma.professional.findMany({
      where: { business_id: businessId },
      orderBy: [
        { orden: 'asc' },
        { creado_en: 'asc' }
      ],
    });
  }

  async findAll() {
    return this.prisma.professional.findMany({
      orderBy: { creado_en: 'desc' }
    });
  }

  async findOne(id: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
    });

    if (!professional) {
      throw new NotFoundException(`Profesional con ID ${id} no encontrado`);
    }

    return professional;
  }

  async update(id: string, updateProfessionalDto: UpdateProfessionalDto) {
    const professional = await this.findOne(id);

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (professional.usuario_id) {
          await tx.usuarios.update({
            where: { id: professional.usuario_id },
            data: {
              telefono: updateProfessionalDto.telefono,
              movil1: updateProfessionalDto.movil1,
              direccion: updateProfessionalDto.direccion,
            }
          });

          await tx.perfil_doctor.update({
            where: { usuario_id: professional.usuario_id },
            data: {
              numero_colegiado: updateProfessionalDto.numero_colegiado,
              especialidad_primaria: updateProfessionalDto.especialidad_primaria,
              universidad_egreso: updateProfessionalDto.universidad_egreso,
              anos_experiencia: updateProfessionalDto.anos_experiencia,
              biografia: updateProfessionalDto.descripcion,
            }
          });
        }

        return tx.professional.update({
          where: { id },
          data: {
            nombre: updateProfessionalDto.nombre,
            cargo: updateProfessionalDto.cargo,
            formacion: updateProfessionalDto.formacion,
            descripcion: updateProfessionalDto.descripcion,
            foto_url: updateProfessionalDto.foto_url,
            orden: updateProfessionalDto.orden,
            linkedin_url: updateProfessionalDto.linkedin_url,
            instagram_url: updateProfessionalDto.instagram_url,
            actualizado_en: new Date(),
          },
        });
      });
    } catch (error) {
      console.error('Error al actualizar profesional en Prisma:', error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.professional.delete({
      where: { id },
    });
  }
}

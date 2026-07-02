import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { PrismaService } from '../prisma.service';
import type { AuthUser } from '../auth/auth.types';

@Injectable()
export class PresupuestosService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertPatientAccess(pacienteId: string, actor: AuthUser) {
    const paciente = await this.prisma.usuarios.findUnique({
      where: { id: pacienteId },
      select: { id: true, business_id: true },
    });

    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    if (actor.rol === 'TECHSOFT') return paciente;

    if (actor.rol === 'PACIENTE' && paciente.id !== actor.sub) {
      throw new ForbiddenException('No puede acceder a presupuestos de otro paciente.');
    }

    if (actor.rol !== 'PACIENTE' && (!actor.business_id || paciente.business_id !== actor.business_id)) {
      throw new ForbiddenException('El paciente no pertenece al negocio autenticado.');
    }

    return paciente;
  }

  private assertDocumentAccess(
    doc: { paciente_id: string; usuario?: { business_id: string | null } },
    actor: AuthUser,
  ) {
    if (actor.rol === 'TECHSOFT') return;

    if (actor.rol === 'PACIENTE' && doc.paciente_id !== actor.sub) {
      throw new ForbiddenException('No puede acceder a este presupuesto.');
    }

    if (actor.rol !== 'PACIENTE' && (!actor.business_id || doc.usuario?.business_id !== actor.business_id)) {
      throw new ForbiddenException('El presupuesto no pertenece al negocio autenticado.');
    }
  }

  async create(createPresupuestoDto: CreatePresupuestoDto, actor: AuthUser) {
    const { paciente_id, ...data } = createPresupuestoDto;
    if (!paciente_id) throw new UnauthorizedException('Paciente requerido para crear presupuesto.');
    await this.assertPatientAccess(paciente_id, actor);
    
    return this.prisma.presupuestos_seguros.create({
      data: {
        paciente_id,
        ...data,
        plan_tratamiento: data.plan_tratamiento as any,
        detalle_pagos: data.detalle_pagos as any,
      },
    });
  }

  async findByPaciente(pacienteId: string, actor: AuthUser) {
    await this.assertPatientAccess(pacienteId, actor);

    return this.prisma.presupuestos_seguros.findMany({
      where: { paciente_id: pacienteId },
      orderBy: { creado_en: 'desc' },
    });
  }

  async findOne(id: string, actor: AuthUser) {
    const doc = await this.prisma.presupuestos_seguros.findUnique({
      where: { id },
      include: { usuario: { select: { id: true, business_id: true, nombres: true, apellidos: true } } },
    });
    if (!doc) throw new NotFoundException('Presupuesto no encontrado');
    this.assertDocumentAccess(doc, actor);
    return doc;
  }
}

import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { estado_cita, Prisma } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';

@Injectable()
export class CitasService {
    constructor(private readonly prisma: PrismaService) { }

    private async resolveBusinessId(dto: Pick<CreateCitaDto, 'business_id' | 'usuario_id' | 'doctor_id'>, actor?: AuthUser) {
        if (actor?.business_id && actor.rol !== 'TECHSOFT') return actor.business_id;
        if (dto.business_id) return dto.business_id;

        const [paciente, doctor] = await Promise.all([
            this.prisma.usuarios.findUnique({
                where: { id: dto.usuario_id },
                select: { business_id: true },
            }),
            this.prisma.usuarios.findUnique({
                where: { id: dto.doctor_id },
                select: { business_id: true },
            }),
        ]);

        return paciente?.business_id || doctor?.business_id || null;
    }

    private assertBusinessAccess(cita: { business_id: string | null; paciente_id: string }, actor: AuthUser) {
        if (actor.rol === 'TECHSOFT') return;

        if (actor.rol === 'PACIENTE' && cita.paciente_id !== actor.sub) {
            throw new ForbiddenException('No puede acceder a citas de otro paciente.');
        }

        if (actor.rol !== 'PACIENTE' && (!actor.business_id || cita.business_id !== actor.business_id)) {
            throw new ForbiddenException('La cita no pertenece al negocio autenticado.');
        }
    }

    /**
     * Crea una nueva cita incluyendo el business_id para soporte SaaS
     */
    async create(createCitaDto: CreateCitaDto, actor?: AuthUser) {
        const businessId = await this.resolveBusinessId(createCitaDto, actor);
        if (!businessId) throw new UnauthorizedException('No se pudo resolver el negocio de la cita.');

        const pacienteId = actor?.rol === 'PACIENTE' ? actor.sub : createCitaDto.usuario_id;

        return this.prisma.citas.create({
            data: {
                business_id: businessId,
                paciente_id: pacienteId,
                doctor_id: createCitaDto.doctor_id,
                fecha: new Date(createCitaDto.fecha),
                duracionEstimada: createCitaDto.duracionEstimada,
                motivoConsulta: createCitaDto.motivoConsulta,
                notasInternas: createCitaDto.notasInternas,
                antecedentes_clinicos: createCitaDto.antecedentes_clinicos || [],
                observaciones_paciente: createCitaDto.observaciones_paciente,
                nivel_dolor: createCitaDto.nivel_dolor,
                tipo_paciente: createCitaDto.tipo_paciente,
                servicio_cita: createCitaDto.servicio_cita,
                precioEstimado: createCitaDto.precioEstimado,
                estado: createCitaDto.estado ?? estado_cita.PENDIENTE,
                googleEventId: createCitaDto.googleEventId,
            },
            include: {
                paciente: {
                    select: { nombres: true, apellidos: true, email: true }
                },
                doctor: {
                    select: { id: true, nombres: true, apellidos: true }
                },
                business: {
                    select: { nombre_empresa: true }
                }
            }
        });
    }

    /**
     * Obtiene las citas de un negocio específico (SaaS)
     */
    async findByBusiness(businessId: string | null) {
        if (!businessId) throw new UnauthorizedException('Negocio requerido para consultar citas.');
        return this.prisma.citas.findMany({
            where: { business_id: businessId },
            orderBy: { fecha: 'asc' },
            include: {
                paciente: {
                    select: { nombres: true, apellidos: true, email: true }
                },
                doctor: {
                    select: { id: true, nombres: true, apellidos: true }
                },
                business: {
                    select: { nombre_empresa: true }
                }
            }
        });
    }

    /**
     * Actualiza solo el estado de la cita de forma atómica
     */
    async updateEstado(id: string, nuevoEstado: string, actor?: AuthUser) {
        const cita = await this.findOne(id);
        if (actor) this.assertBusinessAccess(cita, actor);

        return this.prisma.citas.update({
            where: { id },
            data: { estado: nuevoEstado as estado_cita },
            include: {
                paciente: {
                    select: { nombres: true, apellidos: true, email: true }
                },
                doctor: {
                    select: { id: true, nombres: true, apellidos: true }
                },
                business: {
                    select: { nombre_empresa: true }
                }
            }
        });
    }

    async findAll(actor?: AuthUser) {
        const where: Prisma.citasWhereInput = actor
            ? actor.rol === 'TECHSOFT'
                ? {}
                : actor.rol === 'PACIENTE'
                    ? { paciente_id: actor.sub }
                    : { business_id: actor.business_id || undefined }
            : {};

        return this.prisma.citas.findMany({
            where,
            orderBy: { fecha: 'desc' },
            include: {
                paciente: {
                    select: { nombres: true, apellidos: true, email: true }
                },
                doctor: {
                    select: { id: true, nombres: true, apellidos: true }
                },
                business: {
                    select: { nombre_empresa: true }
                }
            }
        });
    }

    async findOne(id: string) {
        const cita = await this.prisma.citas.findUnique({
            where: { id },
            include: {
                paciente: {
                    select: { nombres: true, apellidos: true, email: true }
                },
                doctor: {
                    select: { id: true, nombres: true, apellidos: true }
                },
                business: {
                    select: { nombre_empresa: true }
                }
            }
        });

        if (!cita) throw new NotFoundException(`Cita con id ${id} no encontrada`);

        return cita;
    }

    async findOneScoped(id: string, actor: AuthUser) {
        const cita = await this.findOne(id);
        this.assertBusinessAccess(cita, actor);
        return cita;
    }

    async update(id: string, updateCitaDto: UpdateCitaDto, actor?: AuthUser) {
        const citaExistente = await this.findOne(id);
        if (actor) this.assertBusinessAccess(citaExistente, actor);

        const dataUpdate: Prisma.citasUncheckedUpdateInput = {
            business_id: citaExistente.business_id,
            paciente_id: updateCitaDto.usuario_id ?? citaExistente.paciente_id,
            doctor_id: updateCitaDto.doctor_id ?? citaExistente.doctor_id,
            fecha: updateCitaDto.fecha ? new Date(updateCitaDto.fecha) : citaExistente.fecha,
            duracionEstimada: updateCitaDto.duracionEstimada ?? citaExistente.duracionEstimada,
            motivoConsulta: updateCitaDto.motivoConsulta ?? citaExistente.motivoConsulta,
            notasInternas: updateCitaDto.notasInternas ?? citaExistente.notasInternas,
            observaciones_paciente: updateCitaDto.observaciones_paciente ?? citaExistente.observaciones_paciente,
            nivel_dolor: updateCitaDto.nivel_dolor ?? citaExistente.nivel_dolor,
            tipo_paciente: updateCitaDto.tipo_paciente ?? citaExistente.tipo_paciente,
            servicio_cita: updateCitaDto.servicio_cita ?? citaExistente.servicio_cita,
            precioEstimado: updateCitaDto.precioEstimado ?? citaExistente.precioEstimado,
            estado: updateCitaDto.estado ?? citaExistente.estado,
            googleEventId: updateCitaDto.googleEventId ?? citaExistente.googleEventId,
        };

        if (updateCitaDto.antecedentes_clinicos !== undefined) {
            dataUpdate.antecedentes_clinicos = updateCitaDto.antecedentes_clinicos;
        }

        return this.prisma.citas.update({
            where: { id },
            data: dataUpdate,
            include: {
                paciente: {
                    select: { nombres: true, apellidos: true, email: true }
                },
                doctor: {
                    select: { id: true, nombres: true, apellidos: true }
                },
                business: {
                    select: { nombre_empresa: true }
                }
            }
        });
    }

    async remove(id: string, actor?: AuthUser) {
        const cita = await this.findOne(id);
        if (actor) this.assertBusinessAccess(cita, actor);
        return this.prisma.citas.delete({ where: { id } });
    }
}

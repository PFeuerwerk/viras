import { Injectable, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Business } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '../auth/jwt.service';
import { AuthUser } from '../auth/auth.types';

@Injectable()
export class UsuariosService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    private sanitizeUsuario<T extends { password_hash?: string | null; perfil_paciente?: any; business?: any; rol?: string }>(usuario: T) {
        const { password_hash, ...safeUsuario } = usuario;
        const normalizedRole = typeof safeUsuario.rol === 'string'
            ? safeUsuario.rol.toUpperCase()
            : safeUsuario.rol;

        return {
            ...safeUsuario,
            rol: normalizedRole,
            doctor_id: safeUsuario.perfil_paciente?.dentista_id || null,
            slug: safeUsuario.business?.slug,
            nombre_empresa: safeUsuario.business?.nombre_empresa,
        };
    }

    private async hashPassword(password: string) {
        return bcrypt.hash(password, 10);
    }

    private async passwordMatches(storedPassword: string, candidate: string) {
        if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
            return bcrypt.compare(candidate, storedPassword);
        }

        return storedPassword === candidate;
    }

    /**
     * CREAR: Registro de Usuario y Negocio (SaaS Multi-tenant)
     * Soporta: Registro de TechSoft, Onboarding de Admin y Registro de Pacientes.
     */
    async crear(datos: CreateUsuarioDto) {
        const emailExiste = await this.prisma.usuarios.findUnique({
            where: { email: datos.email }
        });
        if (emailExiste) throw new ConflictException('El correo electrónico ya está registrado.');

        if (datos.rol === 'ADMIN' && datos.slug) {
            const slugExiste = await this.prisma.business.findUnique({
                where: { slug: datos.slug }
            });
            if (slugExiste) throw new ConflictException('La URL (slug) ya está en uso por otro negocio.');
        }

        return this.prisma.$transaction(async (tx) => {
            let businessId: string | null = datos.business_id || null;
            let nuevoNegocio: Business | null = null;

            if (datos.rol === 'ADMIN' && datos.nombre_empresa && datos.slug) {
                nuevoNegocio = await tx.business.create({
                    data: {
                        nombre_empresa: datos.nombre_empresa,
                        slug: datos.slug,
                    }
                });
                businessId = nuevoNegocio.id;
            }

            if (datos.rol === 'PACIENTE' && datos.slug) {
                const business = await tx.business.findUnique({
                    where: { slug: datos.slug },
                    select: { id: true },
                });
                if (!business) throw new NotFoundException(`No existe ningún negocio con la URL: ${datos.slug}`);
                businessId = business.id;
            }

            if (datos.rol === 'PACIENTE' && datos.dentista_id) {
                const doctor = await tx.usuarios.findFirst({
                    where: {
                        id: datos.dentista_id,
                        rol: 'DOCTOR',
                        ...(businessId ? { business_id: businessId } : {}),
                    },
                    select: { id: true },
                });
                if (!doctor) throw new ConflictException('El doctor seleccionado no pertenece al negocio.');
            }

            const dataPrepared: any = {
                email: datos.email,
                password_hash: await this.hashPassword(datos.password_hash),
                rol: datos.rol || 'PACIENTE',
                nombres: datos.nombres,
                apellidos: datos.apellidos,
                business_id: businessId,
                movil1: datos.movil1?.trim() || null,
                movil2: datos.movil2?.trim() || null,
                tipo_documento: datos.tipo_documento?.trim() || null,
                numero_documento: datos.numero_documento?.trim() || null,
                fecha_nacimiento: datos.fecha_nacimiento ? new Date(datos.fecha_nacimiento) : null,
                genero: datos.genero || null,
                seguridad_social: datos.seguridad_social || null,
                direccion: datos.direccion?.trim() || null,
                avatar: datos.avatar?.trim() || null,
            };

            const usuarioCreado = await tx.usuarios.create({
                data: dataPrepared
            });

            if (usuarioCreado.rol === 'PACIENTE') {
                await tx.perfil_paciente.create({
                    data: {
                        usuario_id: usuarioCreado.id,
                        dentista_id: datos.dentista_id || null,
                        grupo_sanguineo: datos.grupo_sanguineo,
                        ciudad: datos.ciudad,
                        estado_civil: datos.estado_civil,
                        nombre_conyuge: datos.nombre_conyuge,
                        movil_conyuge: datos.movil_conyuge,
                        discapacidad: datos.discapacidad || false,
                        detalles_discapacidad: datos.detalles_discapacidad,
                        consentimiento_email: datos.consentimiento_email || false,
                        consentimiento_sms: datos.consentimiento_sms || false,
                        tutor_nombre: datos.tutor_nombre,
                        tutor_parentesco: datos.tutor_parentesco,
                        tutor_direccion: datos.tutor_direccion,
                        tutor_email: datos.tutor_email,
                        tutor_movil: datos.tutor_movil,
                        tutor_es_responsable: datos.tutor_es_responsable ?? true
                    }
                });
            } else if (usuarioCreado.rol === 'DOCTOR') {
                await tx.perfil_doctor.create({
                    data: {
                        usuario_id: usuarioCreado.id,
                        numero_colegiado: 'PENDIENTE',
                        especialidad_primaria: 'GENERAL'
                    }
                });
            } else if (usuarioCreado.rol === 'ASISTENTE') {
                await tx.perfil_asistente.create({ data: { usuario_id: usuarioCreado.id } });
            } else if (usuarioCreado.rol === 'TECHSOFT') {
                await tx.perfil_techsoft.create({ data: { usuario_id: usuarioCreado.id } });
            }

            return {
                ...this.sanitizeUsuario({
                    ...usuarioCreado,
                    business: nuevoNegocio,
                    perfil_paciente: usuarioCreado.rol === 'PACIENTE'
                        ? { dentista_id: datos.dentista_id || null }
                        : null,
                }),
                business: nuevoNegocio
            };
        });
    }

    /**
     * BUSCAR POR EMAIL: Crucial para procesos de autenticación
     */
    async buscarPorEmail(email: string) {
        return this.prisma.usuarios.findUnique({
            where: { email },
            include: {
                business: true,
                perfil_paciente: true,
                perfil_doctor: true
            }
        });
    }

    async listarTodos() {
        const usuarios = await this.prisma.usuarios.findMany({
            include: { business: true },
            orderBy: { creado_en: 'desc' }
        });

        return usuarios.map(usuario => this.sanitizeUsuario(usuario));
    }

    async listarPorNegocio(businessId: string, rol?: string) {
        const usuarios = await this.prisma.usuarios.findMany({
            where: {
                business_id: businessId,
                ...(rol ? { rol: rol.toUpperCase() } : {}),
                esta_activo: true,
            },
            include: {
                business: true,
                perfil_paciente: true,
                perfil_doctor: true,
            },
            orderBy: [
                { apellidos: 'asc' },
                { nombres: 'asc' },
            ],
        });

        return usuarios.map(usuario => this.sanitizeUsuario(usuario));
    }

    async listarDoctoresPublicosPorNegocio(businessId: string) {
        const doctores = await this.prisma.usuarios.findMany({
            where: {
                business_id: businessId,
                rol: 'DOCTOR',
                esta_activo: true,
            },
            include: {
                perfil_doctor: true,
            },
            orderBy: [
                { apellidos: 'asc' },
                { nombres: 'asc' },
            ],
        });

        return doctores.map(doctor => ({
            id: doctor.id,
            nombres: doctor.nombres,
            apellidos: doctor.apellidos,
            email: doctor.email,
            especialidad: doctor.perfil_doctor?.especialidad_primaria || 'Odontología General',
        }));
    }

    async crearPacienteEnNegocio(datos: CreateUsuarioDto, actor: AuthUser) {
        if (!actor.business_id) {
            throw new UnauthorizedException('El usuario autenticado no tiene negocio asociado.');
        }

        return this.crear({
            ...datos,
            rol: 'PACIENTE',
            business_id: actor.business_id,
        });
    }

    async buscarPorId(id: string) {
        const usuario = await this.prisma.usuarios.findUnique({
            where: { id },
            include: {
                business: true,
                perfil_paciente: true,
                perfil_doctor: true
            }
        });
        if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        return this.sanitizeUsuario(usuario);
    }

    async buscarPorIdScoped(id: string, actor: AuthUser) {
        const usuario = await this.buscarPorId(id);
        this.assertUserAccess(usuario, actor);
        return usuario;
    }
	
    async actualizar(id: string, datos: UpdateUsuarioDto, actor?: AuthUser) {
        const usuarioExistente = await this.buscarPorId(id);
        if (actor) this.assertUserAccess(usuarioExistente, actor);

        return this.prisma.$transaction(async (tx) => {
            // 1. Separar datos de usuario vs perfil_paciente
            const {
                grupo_sanguineo, ciudad, estado_civil, nombre_conyuge, movil_conyuge,
                discapacidad, detalles_discapacidad, consentimiento_email, consentimiento_sms,
                tutor_nombre, tutor_parentesco, tutor_direccion, tutor_email, tutor_movil, tutor_es_responsable,
                ...datosUsuario
            } = datos;

            // 2. Preparar datos de usuario
            const dataPrepared: any = { ...datosUsuario };
            if (datos.fecha_nacimiento) dataPrepared.fecha_nacimiento = new Date(datos.fecha_nacimiento);
            if (datos.password_hash) dataPrepared.password_hash = await this.hashPassword(datos.password_hash);

            // 3. Actualizar tabla usuarios
            const usuarioActualizado = await tx.usuarios.update({
                where: { id },
                data: dataPrepared,
                include: { perfil_paciente: true }
            });

            // 4. Si es paciente, actualizar perfil_paciente
            if (usuarioExistente.rol === 'PACIENTE') {
                const datosPerfil: any = {};
                if (grupo_sanguineo !== undefined) datosPerfil.grupo_sanguineo = grupo_sanguineo;
                if (ciudad !== undefined) datosPerfil.ciudad = ciudad;
                if (estado_civil !== undefined) datosPerfil.estado_civil = estado_civil;
                if (nombre_conyuge !== undefined) datosPerfil.nombre_conyuge = nombre_conyuge;
                if (movil_conyuge !== undefined) datosPerfil.movil_conyuge = movil_conyuge;
                if (discapacidad !== undefined) datosPerfil.discapacidad = discapacidad;
                if (detalles_discapacidad !== undefined) datosPerfil.detalles_discapacidad = detalles_discapacidad;
                if (consentimiento_email !== undefined) datosPerfil.consentimiento_email = consentimiento_email;
                if (consentimiento_sms !== undefined) datosPerfil.consentimiento_sms = consentimiento_sms;
                if (tutor_nombre !== undefined) datosPerfil.tutor_nombre = tutor_nombre;
                if (tutor_parentesco !== undefined) datosPerfil.tutor_parentesco = tutor_parentesco;
                if (tutor_direccion !== undefined) datosPerfil.tutor_direccion = tutor_direccion;
                if (tutor_email !== undefined) datosPerfil.tutor_email = tutor_email;
                if (tutor_movil !== undefined) datosPerfil.tutor_movil = tutor_movil;
                if (tutor_es_responsable !== undefined) datosPerfil.tutor_es_responsable = tutor_es_responsable;

                if (Object.keys(datosPerfil).length > 0) {
                    await tx.perfil_paciente.update({
                        where: { usuario_id: id },
                        data: datosPerfil
                    });
                }
            }

            return this.sanitizeUsuario(usuarioActualizado);
        });
    }

    async eliminar(id: string, actor: AuthUser) {
        const usuario = await this.buscarPorId(id);
        this.assertUserAccess(usuario, actor);

        if (usuario.id === actor.sub) {
            throw new ForbiddenException('No puede dar de baja su propio usuario.');
        }

        return this.prisma.usuarios.update({
            where: { id },
            data: {
                esta_activo: false,
                actualizado_en: new Date(),
            },
            include: {
                business: true,
                perfil_paciente: true,
                perfil_doctor: true,
            },
        }).then(updated => this.sanitizeUsuario(updated));
    }

    private assertUserAccess(usuario: { id?: string; business_id?: string | null }, actor: AuthUser) {
        if (actor.rol === 'TECHSOFT') return;

        if (actor.rol === 'PACIENTE' && usuario.id !== actor.sub) {
            throw new ForbiddenException('No puede acceder a otro usuario.');
        }

        if (actor.rol !== 'PACIENTE' && (!actor.business_id || usuario.business_id !== actor.business_id)) {
            throw new ForbiddenException('El usuario no pertenece al negocio autenticado.');
        }
    }

    /**
     * VALIDAR LOGIN: Adaptado para multi-rol con redirección inteligente.
     */
    async validarLogin(email: string, pass: string) {
        const usuario = await this.prisma.usuarios.findUnique({
            where: { email },
            include: {
                business: true,
                perfil_paciente: true,
                perfil_doctor: true
            }
        });

        if (!usuario || !(await this.passwordMatches(usuario.password_hash, pass))) {
            throw new UnauthorizedException('Credenciales inválidas.');
        }

        if (usuario.rol === 'ADMIN' && !usuario.business_id) {
            throw new UnauthorizedException('El administrador no tiene un negocio vinculado.');
        }

        const safeUser = this.sanitizeUsuario(usuario);
        return {
            success: true,
            access_token: this.jwtService.sign({
                sub: usuario.id,
                email: usuario.email,
                rol: safeUser.rol,
                business_id: usuario.business_id,
            }),
            user: safeUser
        };
    }
}

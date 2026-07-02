import {
    Controller,
    Post,
    Body,
    Get,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseUUIDPipe,
    Query
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    /**
     * CREAR: Soporta tanto JSON (SaaS Onboarding) como Multipart (Perfiles con foto).
     * Permite la creación atómica de Usuario + Negocio si el rol es ADMIN.
     */
    @Post()
    @Public()
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiOperation({ summary: 'Crear un nuevo usuario (y negocio si el rol es ADMIN)' })
    async crear(
        @Body() datos: CreateUsuarioDto,
        @UploadedFile() file?: any
    ) {
        // Si se sube un archivo físico, asignamos la referencia al campo avatar
        if (file) {
            datos.avatar = file.filename || file.location;
        }

        return this.usuariosService.crear(datos);
    }

    @Post('business/current/pacientes')
    @Roles('ADMIN', 'ASISTENTE')
    @ApiOperation({ summary: 'Crear paciente en el negocio del usuario autenticado' })
    async crearPacienteEnNegocio(
        @Body() datos: CreateUsuarioDto,
        @CurrentUser() user: AuthUser
    ) {
        return this.usuariosService.crearPacienteEnNegocio(datos, user);
    }

    /**
     * LISTAR: Obtiene todos los usuarios del sistema.
     * Ideal para la vista global del usuario tecSoft.
     */
    @Get()
    @Roles('TECHSOFT')
    @ApiOperation({ summary: 'Listar todos los usuarios registrados en el SaaS' })
    async listar() {
        return this.usuariosService.listarTodos();
    }

    @Get('business/:businessId')
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'TECHSOFT')
    @ApiOperation({ summary: 'Listar usuarios de un negocio, opcionalmente filtrados por rol' })
    async listarPorNegocio(
        @Param('businessId', new ParseUUIDPipe()) businessId: string,
        @Query('rol') rol: string | undefined,
        @CurrentUser() user: AuthUser
    ) {
        const scopedBusinessId = user.rol === 'TECHSOFT' ? businessId : user.business_id;
        if (!scopedBusinessId) return [];
        return this.usuariosService.listarPorNegocio(scopedBusinessId, rol);
    }

    @Get('public/business/:businessId/doctors')
    @Public()
    @ApiOperation({ summary: 'Listar doctores públicos de un negocio para registro de pacientes' })
    async listarDoctoresPublicos(
        @Param('businessId', new ParseUUIDPipe()) businessId: string
    ) {
        return this.usuariosService.listarDoctoresPublicosPorNegocio(businessId);
    }

    /**
     * OBTENER POR ID: Detalle de un usuario específico.
     */
    @Get(':id')
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'PACIENTE', 'TECHSOFT')
    @ApiOperation({ summary: 'Obtener el detalle de un usuario por ID' })
    async obtenerUno(
        @Param('id', new ParseUUIDPipe()) id: string,
        @CurrentUser() user: AuthUser
    ) {
        return this.usuariosService.buscarPorIdScoped(id, user);
    }

    /**
     * ACTUALIZAR: Modifica datos de perfil.
     */
    @Patch(':id')
    @Roles('ADMIN', 'ASISTENTE', 'PACIENTE', 'TECHSOFT')
    @ApiOperation({ summary: 'Actualizar la información de un usuario' })
    async actualizar(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() datos: UpdateUsuarioDto,
        @CurrentUser() user: AuthUser
    ) {
        return this.usuariosService.actualizar(id, datos, user);
    }

    /**
     * ELIMINAR: baja lógica del usuario para conservar historial.
     */
    @Delete(':id')
    @Roles('ADMIN', 'TECHSOFT')
    @ApiOperation({ summary: 'Dar de baja lógica a un usuario del sistema' })
    async eliminar(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthUser) {
        return this.usuariosService.eliminar(id, user);
    }

    /**
     * LOGIN: Endpoint de autenticación.
     */
    @Post('login')
    @Public()
    @ApiOperation({ summary: 'Autenticación de acceso al sistema' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'admin@negocio.com' },
                password: { type: 'string', example: '123456' }
            }
        }
    })
    async login(@Body() credenciales: { email: string; password: string }) {
        return await this.usuariosService.validarLogin(credenciales.email, credenciales.password);
    }
}

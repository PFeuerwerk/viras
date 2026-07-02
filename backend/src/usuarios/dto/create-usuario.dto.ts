import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsOptional,
    MinLength,
    MaxLength,
    Matches,
    IsUUID
} from 'class-validator';

export class CreateUsuarioDto {

    @ApiProperty({ example: 'usuario@correo.com' })
    @IsEmail({}, { message: 'El formato del correo no es válido' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password_hash: string;

    @ApiProperty({ example: 'PACIENTE', description: 'Roles: ADMIN, DOCTOR, PACIENTE, ASISTENTE, TECHSOFT' })
    @IsNotEmpty()
    @IsString()
    rol: string;

    @ApiProperty({ example: 'Juan' })
    @IsNotEmpty()
    @IsString()
    nombres: string;

    @ApiProperty({ example: 'Pérez' })
    @IsNotEmpty()
    @IsString()
    apellidos: string;

    // --- VÍNCULO CON NEGOCIO EXISTENTE ---
    @ApiProperty({ example: 'uuid-del-negocio', required: false })
    @IsOptional()
    @IsUUID('4', { message: 'El ID del negocio debe ser un UUID válido' })
    business_id?: string;

    // --- NUEVO: ASIGNACIÓN DE DOCTOR ---
    @ApiProperty({ example: 'uuid-del-doctor', required: false })
    @IsOptional()
    @IsUUID('4', { message: 'El ID del doctor debe ser un UUID válido' })
    dentista_id?: string;

    // --- CREACIÓN DE NEGOCIO ---
    @ApiProperty({ example: 'Mi Clínica Dental', required: false })
    @IsOptional()
    @IsString()
    @MinLength(3)
    nombre_empresa?: string;

    @ApiProperty({ example: 'mi-clinica-dental', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    slug?: string;

    // --- PERFIL ---
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tipo_documento?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    numero_documento?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fecha_nacimiento?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    genero?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    seguridad_social?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    movil1?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    movil2?: string;

    @ApiProperty({ example: 'Calle Falsa 123', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    direccion?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    // --- CAMPOS ADICIONALES PACIENTE ---
    @IsOptional() @IsString() grupo_sanguineo?: string;
    @IsOptional() @IsString() ciudad?: string;
    @IsOptional() @IsString() estado_civil?: string;
    @IsOptional() @IsString() nombre_conyuge?: string;
    @IsOptional() @IsString() movil_conyuge?: string;
    @IsOptional() discapacidad?: boolean;
    @IsOptional() @IsString() detalles_discapacidad?: string;
    @IsOptional() consentimiento_email?: boolean;
    @IsOptional() consentimiento_sms?: boolean;

    // --- DATOS TUTOR ---
    @IsOptional() @IsString() tutor_nombre?: string;
    @IsOptional() @IsString() tutor_parentesco?: string;
    @IsOptional() @IsString() tutor_direccion?: string;
    @IsOptional() @IsString() tutor_email?: string;
    @IsOptional() @IsString() tutor_movil?: string;
    @IsOptional() tutor_es_responsable?: boolean;
}
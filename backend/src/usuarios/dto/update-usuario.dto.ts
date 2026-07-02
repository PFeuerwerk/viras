// src/usuarios/dto/update-usuario.dto.ts
import { IsEmail, IsOptional, IsString, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUsuarioDto {
    @ApiPropertyOptional({ example: 'usuario@viras.com' })
    @IsOptional()
    @IsEmail({}, { message: 'El formato del correo no es válido' })
    email?: string;

    @ApiPropertyOptional({ example: 'hashedpassword123' })
    @IsOptional()
    @IsString()
    password_hash?: string;

    @ApiPropertyOptional({ example: 'DOCTOR' })
    @IsOptional()
    @IsString()
    rol?: string;

    @ApiPropertyOptional({ example: 'Juan' })
    @IsOptional()
    @IsString()
    nombres?: string;

    @ApiPropertyOptional({ example: 'Pérez' })
    @IsOptional()
    @IsString()
    apellidos?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    tipo_documento?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    numero_documento?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    fecha_nacimiento?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    genero?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    seguridad_social?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    movil1?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    movil2?: string;

    @ApiPropertyOptional({ example: 'Calle Falsa 123', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    direccion?: string;

    @ApiPropertyOptional({ required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    // --- CAMPOS ADICIONALES PACIENTE ---
    @IsOptional() @IsString() grupo_sanguineo?: string;
    @IsOptional() @IsString() ciudad?: string;
    @IsOptional() @IsString() estado_civil?: string;
    @IsOptional() @IsString() nombre_conyuge?: string;
    @IsOptional() @IsString() movil_conyuge?: string;
    @IsOptional() @IsBoolean() discapacidad?: boolean;
    @IsOptional() @IsString() detalles_discapacidad?: string;
    @IsOptional() @IsBoolean() consentimiento_email?: boolean;
    @IsOptional() @IsBoolean() consentimiento_sms?: boolean;

    // --- DATOS TUTOR ---
    @IsOptional() @IsString() tutor_nombre?: string;
    @IsOptional() @IsString() tutor_parentesco?: string;
    @IsOptional() @IsString() tutor_direccion?: string;
    @IsOptional() @IsString() tutor_email?: string;
    @IsOptional() @IsString() tutor_movil?: string;
    @IsOptional() @IsBoolean() tutor_es_responsable?: boolean;
}

import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    MaxLength,
    IsInt,
    Min,
    IsEmail,
    MinLength
} from 'class-validator';

export class CreateProfessionalDto {
    @IsUUID()
    @IsNotEmpty()
    business_id: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    cargo: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    formacion?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    foto_url?: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    orden?: number;

    @IsString()
    @IsOptional()
    linkedin_url?: string;

    @IsString()
    @IsOptional()
    instagram_url?: string;

    // --- DATOS DE USUARIO REAL DOCTOR ---

    @IsEmail({}, { message: 'El email del doctor no tiene un formato válido.' })
    @IsNotEmpty({ message: 'El email del doctor es obligatorio.' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña del doctor es obligatoria.' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    password_hash: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    telefono?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    movil1?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    direccion?: string;

    // --- PERFIL CLÍNICO DOCTOR ---

    @IsString()
    @IsOptional()
    @MaxLength(50)
    numero_colegiado?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    especialidad_primaria?: string;

    @IsString()
    @IsOptional()
    universidad_egreso?: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    anos_experiencia?: number;
}
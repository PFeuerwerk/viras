import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, IsEnum, ValidateNested, IsObject, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoNegocio } from '@prisma/client';

// DTO para los puntos clave de la metodología
export class QueHacemosItemDto {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    icono?: string;
}

// Estructura de la sección "Qué Hacemos"
export class QueHacemosSeccionDto {
    @IsString()
    @IsOptional()
    titulo?: string;

    @IsString()
    @IsOptional()
    introduccion?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => QueHacemosItemDto)
    items?: QueHacemosItemDto[];
}

export class ServiceItemDto {
    @IsString()
    @IsOptional()
    titulo?: string;

    /**
     * Descripción ampliada: Se aumenta el límite a 1000 caracteres 
     * para permitir textos detallados que soporten la funcionalidad "Leer más".
     */
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    descripcion?: string;

    @IsString()
    @IsOptional()
    icono?: string;

    @IsString()
    @IsOptional()
    precio_estimado?: string;
}

// NUEVO: DTO para validar los tipos de cita (Booking Cards)
export class BookingServiceDto {
    @IsString()
    @IsOptional()
    titulo?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    descripcion?: string;

    @IsInt()
    @IsOptional()
    duracion_minutos?: number;

    @IsBoolean()
    @IsOptional()
    es_emergencia?: boolean;

    @IsString()
    @IsOptional()
    icono?: string;
}

export class ReviewItemDto {
    @IsString()
    @IsOptional()
    nombre_cliente?: string;

    @IsString()
    @IsOptional()
    comentario?: string;

    @IsOptional()
    puntuacion?: number;

    @IsString()
    @IsOptional()
    foto_url?: string;
}

export class CreateBusinessDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @IsEnum(TipoNegocio)
    @IsOptional()
    tipo_negocio?: TipoNegocio;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre_empresa: string;

    @IsOptional()
    logo_url?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    titulo_hero?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    slogan_hero?: string;

    @IsString()
    @IsOptional()
    descripcion_hero?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    horario_texto?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    direccion?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    telefono?: string;

    @IsString()
    @IsOptional()
    google_maps_link?: string;

    // --- Redes Sociales autorizadas ---
    @IsString()
    @IsOptional()
    facebook_url?: string;

    @IsString()
    @IsOptional()
    instagram_url?: string;

    @IsString()
    @IsOptional()
    twitter_url?: string;

    @IsString()
    @IsOptional()
    linkedin_url?: string;

    @IsOptional()
    @IsObject()
    config_visual?: any;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ServiceItemDto)
    servicios?: ServiceItemDto[];

    // NUEVO: Validación autorizada para los servicios de cita
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => BookingServiceDto)
    booking_services?: BookingServiceDto[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ReviewItemDto)
    reviews?: ReviewItemDto[];

    // --- Nueva sección autorizada para validación ---
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => QueHacemosSeccionDto)
    seccion_que_hacemos?: QueHacemosSeccionDto;
}

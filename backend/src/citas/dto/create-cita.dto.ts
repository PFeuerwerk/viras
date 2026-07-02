// src/citas/dto/create-cita.dto.ts
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsNumber,
    IsUUID,
    IsArray
} from 'class-validator';
import { estado_cita } from '@prisma/client';

export class CreateCitaDto {

    @IsOptional()
    @IsUUID()
    business_id?: string;

    @IsDateString()
    fecha: string;

    @IsInt()
    duracionEstimada: number;

    @IsString()
    motivoConsulta: string;

    @IsOptional()
    @IsString()
    notasInternas?: string;

    @IsOptional()
    @IsNumber()
    precioEstimado?: number;

    @IsOptional()
    @IsEnum(estado_cita)
    estado?: estado_cita;

    @IsUUID()
    usuario_id: string; // paciente_id

    @IsUUID()
    doctor_id: string;

    @IsOptional()
    @IsString()
    googleEventId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    antecedentes_clinicos?: string[];

    @IsOptional()
    @IsString()
    observaciones_paciente?: string;

    @IsOptional()
    @IsInt()
    nivel_dolor?: number;

    @IsOptional()
    @IsString()
    tipo_paciente?: string;

    @IsOptional()
    @IsString()
    servicio_cita?: string;
}
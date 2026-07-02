// src/citas/dto/update-cita.dto.ts
import {
    IsOptional,
    IsString,
    IsNumber,
    IsUUID,
    IsDateString,
    IsEnum,
    IsArray,
    IsInt
} from 'class-validator';
import { estado_cita } from '@prisma/client';

export class UpdateCitaDto {

    @IsOptional()
    @IsUUID()
    business_id?: string;

    @IsOptional()
    @IsUUID()
    usuario_id?: string;

    @IsOptional()
    @IsUUID()
    doctor_id?: string;

    @IsOptional()
    @IsDateString()
    fecha?: string;

    @IsOptional()
    @IsNumber()
    duracionEstimada?: number;

    @IsOptional()
    @IsString()
    motivoConsulta?: string;

    @IsOptional()
    @IsString()
    notasInternas?: string;

    @IsOptional()
    @IsNumber()
    precioEstimado?: number;

    @IsOptional()
    @IsEnum(estado_cita)
    estado?: estado_cita;

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
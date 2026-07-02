import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePresupuestoDto {
  @ApiProperty()
  @IsUUID()
  paciente_id: string;

  // Seguro
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aseguradora_compania?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aseguradora_poliza?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aseguradora_titular?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aseguradora_numero?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aseguradora_cobertura?: string;

  // Tratamiento
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  diagnostico_general?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  plan_tratamiento?: any[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observaciones_clinicas?: string;

  // Presupuesto
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  importe_total?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  aceptacion_economica?: boolean;

  // Pago
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  modalidad_pago?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  detalle_pagos?: any[];

  // Validez
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  validez_dias?: number;

  // Firmas
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firma_paciente?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firma_representante?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firma_profesional?: string;
}

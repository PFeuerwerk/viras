import { IsString, IsOptional, IsBoolean, IsObject, IsUUID, IsDateString } from 'class-validator';

export class CreateAnamnesisDto {
  @IsUUID()
  paciente_id: string;

  // --- INFORMACIÓN GENERAL ---
  @IsOptional() @IsString() preocupacion_dental?: string;
  @IsOptional() @IsString() sugerencia_tratamiento?: string;
  @IsOptional() @IsString() cirugias_previas?: string;
  @IsOptional() @IsString() porque_eligio_clinica?: string;
  @IsOptional() @IsString() medicamentos_actuales?: string;
  @IsOptional() @IsString() tratamiento_previo_ortodoncia?: string;
  @IsOptional() @IsString() familiares_en_clinica?: string;
  @IsOptional() @IsString() actividades_afectan_mandibula?: string;
  @IsOptional() @IsBoolean() embarazo_lactancia?: boolean;

  // --- SECCIONES JSON (Checkboxes Si/No/NS) ---
  @IsOptional() @IsObject() historial_medico_json?: any;
  @IsOptional() @IsObject() alergias_json?: any;
  @IsOptional() @IsObject() historial_dental_json?: any;
  @IsOptional() @IsObject() antecedentes_familiares_json?: any;

  // --- COMPATIBILIDAD Y EXISTENTES ---
  @IsOptional() @IsString() motivo_consulta?: string;
  @IsOptional() @IsDateString() ultima_visita_dental?: string;
  @IsOptional() @IsString() frecuencia_cepillado?: string;
  @IsOptional() @IsBoolean() uso_hilo_dental?: boolean;
  @IsOptional() @IsBoolean() sensibilidad_dental?: boolean;
  @IsOptional() @IsBoolean() dolor_actual?: boolean;
  @IsOptional() @IsString() detalles_problemas_dentales?: string;
  
  @IsOptional() @IsObject() respuestas_evaluacion?: any;
  @IsOptional() @IsBoolean() fuma?: boolean;
  @IsOptional() @IsString() frecuencia_fumar?: string;
  @IsOptional() @IsString() observaciones_adicionales?: string;
}

import { IsBoolean, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class UpdateConsentimientosDto {
  @IsUUID()
  paciente_id: string;

  @IsOptional() @IsBoolean() general_odontologico?: boolean;
  @IsOptional() @IsDateString() general_fecha?: string;
  @IsOptional() @IsString() general_firma?: string;

  @IsOptional() @IsBoolean() anestesia_sedacion?: boolean;
  @IsOptional() @IsBoolean() anestesia_local_auth?: boolean;
  @IsOptional() @IsBoolean() anestesia_sedacion_auth?: boolean;
  @IsOptional() @IsBoolean() anestesia_salud_decl?: boolean;
  @IsOptional() @IsDateString() anestesia_fecha?: string;
  @IsOptional() @IsString() anestesia_firma?: string;

  @IsOptional() @IsBoolean() proteccion_datos?: boolean;
  @IsOptional() @IsBoolean() lopd_uso_asistencial?: boolean;
  @IsOptional() @IsBoolean() lopd_uso_docente?: boolean;
  @IsOptional() @IsBoolean() lopd_uso_publicitario?: boolean;
  @IsOptional() @IsBoolean() lopd_uso_antes_despues?: boolean;
  @IsOptional() @IsDateString() lopd_fecha?: string;
  @IsOptional() @IsString() lopd_firma?: string;

  @IsOptional() @IsBoolean() representante_legal?: boolean;
  @IsOptional() @IsString() representante_nombre?: string;
  @IsOptional() @IsString() representante_dni?: string;
  @IsOptional() @IsString() representante_relacion?: string;
  @IsOptional() @IsDateString() representante_fecha?: string;
  @IsOptional() @IsString() representante_firma?: string;

  @IsOptional() @IsBoolean() politicas_privacidad?: boolean;
  @IsOptional() @IsDateString() politicas_fecha?: string;
}

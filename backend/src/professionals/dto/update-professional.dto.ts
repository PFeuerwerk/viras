import { PartialType } from '@nestjs/swagger';
import { CreateProfessionalDto } from './create-professional.dto';

/**
 * UpdateProfessionalDto hereda todas las validaciones de CreateProfessionalDto
 * pero marca todos los campos como opcionales (@IsOptional).
 * Esto permite realizar actualizaciones parciales en la base de datos.
 */
export class UpdateProfessionalDto extends PartialType(CreateProfessionalDto) { }

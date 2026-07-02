import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConsentimientosService } from './consentimientos.service';
import { UpdateConsentimientosDto } from './dto/update-consentimientos.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('consentimientos')
export class ConsentimientosController {
  constructor(private readonly service: ConsentimientosService) {}

  @Post()
  @Roles('PACIENTE', 'DOCTOR', 'ASISTENTE', 'ADMIN')
  upsert(@Body() dto: UpdateConsentimientosDto) {
    return this.service.upsert(dto);
  }

  @Get(':pacienteId')
  @Roles('PACIENTE', 'DOCTOR', 'ASISTENTE', 'ADMIN')
  findOne(@Param('pacienteId') pacienteId: string) {
    return this.service.findOne(pacienteId);
  }
}

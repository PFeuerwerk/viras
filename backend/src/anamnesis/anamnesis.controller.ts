import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { AnamnesisService } from './anamnesis.service';
import { CreateAnamnesisDto } from './dto/create-anamnesis.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('anamnesis')
@Controller('anamnesis')
export class AnamnesisController {
  constructor(private readonly anamnesisService: AnamnesisService) {}

  @Post()
  @Roles('PACIENTE', 'DOCTOR', 'ASISTENTE', 'ADMIN')
  @ApiOperation({ summary: 'Crear o actualizar la anamnesis de un paciente' })
  async save(@Body() dto: CreateAnamnesisDto) {
    return this.anamnesisService.upsert(dto);
  }

  @Get(':pacienteId')
  @Roles('PACIENTE', 'DOCTOR', 'ASISTENTE', 'ADMIN')
  @ApiOperation({ summary: 'Obtener la anamnesis de un paciente por su ID' })
  async findOne(@Param('pacienteId', new ParseUUIDPipe()) pacienteId: string) {
    return this.anamnesisService.findOne(pacienteId);
  }
}

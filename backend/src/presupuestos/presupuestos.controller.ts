import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PresupuestosService } from './presupuestos.service';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';

@ApiTags('Presupuestos y Seguros')
@Controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly presupuestosService: PresupuestosService) {}

  @Post()
  @Roles('DOCTOR', 'ASISTENTE', 'ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo presupuesto o documento de seguro' })
  create(@Body() createPresupuestoDto: CreatePresupuestoDto, @CurrentUser() user: AuthUser) {
    return this.presupuestosService.create(createPresupuestoDto, user);
  }

  @Get('paciente/:id')
  @Roles('PACIENTE', 'DOCTOR', 'ASISTENTE', 'ADMIN')
  @ApiOperation({ summary: 'Obtener todos los presupuestos de un paciente' })
  findByPaciente(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.presupuestosService.findByPaciente(id, user);
  }

  @Get(':id')
  @Roles('PACIENTE', 'DOCTOR', 'ASISTENTE', 'ADMIN')
  @ApiOperation({ summary: 'Obtener un presupuesto detallado por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.presupuestosService.findOne(id, user);
  }
}

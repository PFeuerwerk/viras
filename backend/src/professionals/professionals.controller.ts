import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe
} from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) { }

  /**
   * Crea un nuevo profesional (Doctor, Estilista, etc.)
   * Vinculado a un business_id específico.
   */
  @Post()
  @Roles('ADMIN', 'TECHSOFT')
  create(@Body() createProfessionalDto: CreateProfessionalDto, @CurrentUser() user: AuthUser) {
    return this.professionalsService.create(createProfessionalDto, user);
  }

  /**
   * Obtiene todos los profesionales de un negocio específico.
   * Útil para la landing page del negocio (Sección Staff).
   */
  @Get('business/:businessId')
  @Public()
  findAllByBusiness(@Param('businessId', new ParseUUIDPipe()) businessId: string) {
    return this.professionalsService.findAllByBusiness(businessId);
  }

  /**
   * Obtiene todos los profesionales (Uso administrativo TecSoft).
   */
  @Get()
  @Roles('TECHSOFT')
  findAll() {
    return this.professionalsService.findAll();
  }

  /**
   * Obtiene el detalle de un profesional específico por su UUID.
   */
  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'TECHSOFT')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.professionalsService.findOne(id);
  }

  /**
   * Actualiza los datos de un profesional (incluyendo formación, redes sociales, etc.)
   */
  @Patch(':id')
  @Roles('ADMIN', 'TECHSOFT')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProfessionalDto: UpdateProfessionalDto
  ) {
    return this.professionalsService.update(id, updateProfessionalDto);
  }

  /**
   * Elimina un profesional del sistema.
   */
  @Delete(':id')
  @Roles('ADMIN', 'TECHSOFT')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.professionalsService.remove(id);
  }
}

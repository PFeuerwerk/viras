import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) { }

  /**
   * Crea un nuevo negocio (SaaS Onboarding).
   */
  @Post()
  @Roles('TECHSOFT')
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto);
  }

  /**
   * Lista todos los negocios registrados.
   * Este es el endpoint que alimenta la Consola TECHSOFT.
   */
  @Get()
  @Public()
  findAll() {
    return this.businessService.findAll();
  }

  /**
   * Endpoint vital para la página pública (Placeholder).
   * Permite cargar la landing page usando la URL personalizada (slug).
   */
  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.businessService.findBySlug(slug);
  }

  /**
   * Obtiene un negocio por su UUID.
   * Utilizado por Rosita (Admin) para cargar su Dashboard privado.
   */
  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'TECHSOFT')
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthUser) {
    const scopedId = user.rol === 'TECHSOFT' ? id : user.business_id;
    return this.businessService.findOne(scopedId);
  }

  /**
   * Actualización de Negocio:
   * Gestiona la persistencia de servicios, reseñas y configuración visual premium.
   */
  @Patch(':id')
  @Roles('ADMIN', 'TECHSOFT')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser() user: AuthUser
  ) {
    const scopedId = user.rol === 'TECHSOFT' ? id : user.business_id;
    return this.businessService.update(scopedId, updateBusinessDto);
  }

  /**
   * Elimina un negocio y toda su configuración asociada.
   */
  @Delete(':id')
  @Roles('TECHSOFT')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.businessService.remove(id);
  }
}

import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    ParseUUIDPipe,
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';

@Controller('citas')
export class CitasController {
    constructor(private readonly citasService: CitasService) { }

    @Post()
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'PACIENTE', 'TECHSOFT')
    create(@Body() createCitaDto: CreateCitaDto, @CurrentUser() user: AuthUser) {
        return this.citasService.create(createCitaDto, user);
    }

    @Get()
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'PACIENTE', 'TECHSOFT')
    findAll(@CurrentUser() user: AuthUser) {
        return this.citasService.findAll(user);
    }

    // --- NUEVO: Obtener citas por Negocio (SaaS) ---
    @Get('business/:businessId')
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'TECHSOFT')
    findByBusiness(
        @Param('businessId', new ParseUUIDPipe()) businessId: string,
        @CurrentUser() user: AuthUser
    ) {
        const scopedBusinessId = user.rol === 'TECHSOFT' ? businessId : user.business_id;
        return this.citasService.findByBusiness(scopedBusinessId);
    }

    @Get(':id')
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'PACIENTE', 'TECHSOFT')
    findOne(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthUser) {
        return this.citasService.findOneScoped(id, user);
    }

    @Patch(':id')
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'PACIENTE', 'TECHSOFT')
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateCitaDto: UpdateCitaDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.citasService.update(id, updateCitaDto, user);
    }

    // --- NUEVO: Actualizar solo el estado de la cita ---
    @Patch(':id/estado')
    @Roles('ADMIN', 'DOCTOR', 'ASISTENTE', 'TECHSOFT')
    updateEstado(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('estado') estado: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.citasService.updateEstado(id, estado, user);
    }

    @Delete(':id')
    @Roles('ADMIN', 'ASISTENTE', 'TECHSOFT')
    remove(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthUser) {
        return this.citasService.remove(id, user);
    }
}

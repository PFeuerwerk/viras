import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';
import { AdminOwnerService } from './admin-owner.service';

@ApiTags('Admin Owner')
@Controller('admin-owner')
export class AdminOwnerController {
  constructor(private readonly adminOwnerService: AdminOwnerService) {}

  @Get('dashboard')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Dashboard ejecutivo agregado del negocio autenticado' })
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.adminOwnerService.getDashboard(user);
  }
}

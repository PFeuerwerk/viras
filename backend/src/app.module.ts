import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtService } from './auth/jwt.service';
import { RolesGuard } from './auth/roles.guard';
import { CitasModule } from './citas/citas.module';
import { PruebaModule } from './prueba/prueba.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { BusinessModule } from './business/business.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { AnamnesisModule } from './anamnesis/anamnesis.module';
import { ConsentimientosModule } from './consentimientos/consentimientos.module';
import { PresupuestosModule } from './presupuestos/presupuestos.module';
import { AdminOwnerModule } from './admin-owner/admin-owner.module';

@Global()
@Module({
  imports: [
    CitasModule,
    PruebaModule,
    UsuariosModule,
    BusinessModule,
    ProfessionalsModule,
    AnamnesisModule,
    ConsentimientosModule,
    PresupuestosModule,
    AdminOwnerModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    PrismaService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [
    PrismaService,
  ],
})
export class AppModule { }

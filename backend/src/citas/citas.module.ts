import { Module } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [CitasController],
    providers: [
        CitasService,
        PrismaService, // Se agrega PrismaService para inyección en CitasService
    ],
    exports: [CitasService], // Exportar si otros módulos van a usar CitasService
})
export class CitasModule { }
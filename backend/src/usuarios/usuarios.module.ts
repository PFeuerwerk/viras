import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '../auth/jwt.service';

@Module({
    controllers: [UsuariosController],
    providers: [UsuariosService, PrismaService, JwtService],
    exports: [UsuariosService], // Exportamos el servicio por si el módulo de Citas necesita validar usuarios
})
export class UsuariosModule { }

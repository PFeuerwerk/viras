import { Module } from '@nestjs/common';
import { ConsentimientosService } from './consentimientos.service';
import { ConsentimientosController } from './consentimientos.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ConsentimientosController],
  providers: [ConsentimientosService, PrismaService],
})
export class ConsentimientosModule {}

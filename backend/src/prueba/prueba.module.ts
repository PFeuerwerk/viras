import { Module } from '@nestjs/common';
import { PruebaController } from './prueba.controller';

@Module({
  controllers: [PruebaController]
})
export class PruebaModule {}

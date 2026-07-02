import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'], // útil para debug
        });
    }

    async onModuleInit() {
        // Conecta a la base de datos cuando inicia NestJS
        await this.$connect();
    }

    async onModuleDestroy() {
        // Cierra la conexión cuando se detiene NestJS
        await this.$disconnect();
    }
}
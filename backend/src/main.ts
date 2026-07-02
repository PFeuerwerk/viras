import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  /**
   * LÍMITES DE CARGA (Aumentados a 50mb para mayor seguridad con Base64)
   * Se asegura que Express pueda procesar los strings masivos de las fotos del staff.
   */
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Habilita CORS para permitir peticiones desde el frontend de Angular
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  /**
   * VALIDACIÓN GLOBAL DE DTOs
   * Ajuste de Calidad Mundial: 
   * - Se desactiva 'forbidNonWhitelisted' temporalmente para evitar que NestJS 
   *   aborte peticiones si hay discrepancias mínimas en los campos de auditoría.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Cambio clave para evitar el bloqueo silencioso
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('VIRAS API - SaaS Multi-tenant')
    .setDescription('API central para gestión de placeholders de negocios y citas')
    .setVersion('1.0')
    .addTag('business')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);

  try {
    await app.listen(port);
  } catch (error) {
    const serverError = error as NodeJS.ErrnoException;

    if (serverError.code === 'EADDRINUSE') {
      console.error(
        `[VIRAS] El puerto ${port} ya esta en uso. Cierra el proceso que lo ocupa o inicia el backend con otro puerto usando PORT=${port + 1} npm run start:dev.`,
      );
      console.error(
        `[VIRAS] Nota: el frontend apunta por defecto a http://localhost:3000/api; si cambias PORT, alinea tambien frontend/src/app/core/api.config.ts.`,
      );
    } else {
      console.error('[VIRAS] No se pudo iniciar el backend.', serverError);
    }

    process.exit(1);
  }

  console.log(`🚀 Backend corriendo en: http://localhost:${port}/api`);
  console.log(`📖 Documentación Swagger en: http://localhost:${port}/api/docs`);
}

bootstrap();

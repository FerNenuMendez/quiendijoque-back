import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());

  // Aumentar el límite para recibir imágenes en Base64
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  // CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Config de Swagger
  const config = new DocumentBuilder()
    .setTitle('¿Quién Dijo Qué? - API')
    .setDescription(
      'Documentación oficial del backend para el juego interactivo de frases.',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token') // Le decimos que usamos Cookies
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT');

  await app.listen(port ?? 3000, '0.0.0.0');
  console.log(`API running on: http://localhost:${port ?? 3000}`);
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // 👇 Actualizamos la config de Swagger
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

  await app.listen(port ?? 3000);
  console.log(`API running on: http://localhost:${port ?? 3000}/api`);
}
void bootstrap();

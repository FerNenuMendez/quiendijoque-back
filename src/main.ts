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
      whitelist: true, // Ignora campos que no estén en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan campos de más
      transform: true, // Convierte tipos automáticamente
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('CB Travel API')
    .setDescription('Documentación de la API de gestión de viajes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT');

  await app.listen(port ?? 3000);
  console.log(`API running on: http://localhost:${port}/api`);
}
void bootstrap();

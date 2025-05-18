import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración de CORS
  app.enableCors();
  
  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Famisuper API')
    .setDescription('API para el sistema de cierre de transacciones Famisuper')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Puerto de la aplicación
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`La aplicación está corriendo en: http://localhost:${port}`);
}
bootstrap();

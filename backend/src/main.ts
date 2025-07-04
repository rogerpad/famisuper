import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
  
  // Configuración de CORS
  app.enableCors({
    origin: true, // Permitir solicitudes desde cualquier origen durante desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });
  
  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
      disableErrorMessages: false,
    }),
  );
  
  // Interceptor global para logging de errores
  app.use((req, res, next) => {
    console.log(`Request ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('Request body:', req.body);
    }
    next();
  });

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
  const port = 4001; // Cambiamos a puerto 4001 para evitar conflictos
  await app.listen(port);
  console.log(`La aplicación está corriendo en: http://localhost:${port}`);
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}
bootstrap();

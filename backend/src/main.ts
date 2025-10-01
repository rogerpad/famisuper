import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  try {
    // Crear instancia del logger personalizado
    let appLogger = new LoggerService();
    
    const app = await NestFactory.create(AppModule, {
      logger: appLogger,
    });
    
    // Registrar el inicio de la aplicación
    appLogger.log('Iniciando aplicación Famisuper API', 'Bootstrap');
  
  // Configuración de CORS - Permitimos cualquier origen durante desarrollo
  app.enableCors({
    origin: true, // Permitir solicitudes desde cualquier origen durante desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
      disableErrorMessages: false,
      validationError: {
        target: true,
        value: true,
      },
      stopAtFirstError: false, // Recolectar todos los errores de validación
      transformOptions: {
        enableImplicitConversion: true, // Habilitar conversión implícita para permitir transformación automática de tipos
      },
    }),
  );
  
  // Registrar el filtro de excepciones personalizado
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // No usar prefijo global para mantener compatibilidad con el frontend
  
  // Obtener la instancia del logger desde la aplicación
  appLogger = app.get(LoggerService);
  
  // Interceptor global para logging de solicitudes
  app.use((req, res, next) => {
    // Registrar la solicitud
    appLogger.log(`Request ${req.method} ${req.url}`, 'HTTP');
    
    // Registrar el cuerpo de la solicitud para métodos POST, PUT y PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      // Evitar registrar datos sensibles
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '***REDACTED***';
      if (sanitizedBody.token) sanitizedBody.token = '***REDACTED***';
      
      appLogger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`, 'HTTP');
    }
    
    // Capturar y registrar la respuesta
    const originalSend = res.send;
    res.send = function(body) {
      // Registrar el código de estado de la respuesta
      const statusCode = res.statusCode;
      
      // Registrar errores con más detalle
      if (statusCode >= 400) {
        let responseBody;
        try {
          responseBody = JSON.parse(body);
        } catch (e) {
          responseBody = body;
        }
        
        appLogger.error(
          `Response ${statusCode} for ${req.method} ${req.url}`,
          JSON.stringify(responseBody),
          'HTTP'
        );
      } else {
        // Registrar respuestas exitosas
        appLogger.log(
          `Response ${statusCode} for ${req.method} ${req.url}`,
          'HTTP'
        );
      }
      
      originalSend.call(this, body);
      return res;
    };
    
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
  const port = 4002; // Cambiamos a puerto 4002 para evitar conflictos
  await app.listen(port);
  appLogger.log(`La aplicación está corriendo en: http://localhost:${port}`, 'Bootstrap');
  } catch (error) {
    // Usar un nuevo logger para registrar errores de inicio
    const bootstrapLogger = new LoggerService();
    bootstrapLogger.error(
      'Error al iniciar la aplicación',
      error.stack || error.toString(),
      'Bootstrap'
    );
    process.exit(1);
  }
}
bootstrap();

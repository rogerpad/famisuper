# Sistema de Logs en Famisuper

## Descripción General

El sistema de logs implementado en Famisuper proporciona una solución centralizada para el registro de eventos, errores y actividades en toda la aplicación. Está diseñado para mejorar la trazabilidad, facilitar la depuración y proporcionar información detallada sobre el funcionamiento del sistema.

## Componentes Principales

### 1. LoggerService

Ubicado en `backend/src/common/services/logger.service.ts`, este servicio proporciona métodos para registrar diferentes tipos de eventos:

- **log**: Para información general
- **debug**: Para información detallada útil durante el desarrollo
- **warn**: Para advertencias que no interrumpen el flujo de la aplicación
- **error**: Para errores que requieren atención
- **logValidationError**: Específico para errores de validación de datos
- **logDatabaseError**: Específico para errores relacionados con la base de datos

El servicio escribe los logs en:
- Archivos diarios en la carpeta `logs/`
- Consola (durante el desarrollo)

### 2. LoggerModule

Ubicado en `backend/src/common/modules/logger.module.ts`, este módulo NestJS hace que el servicio de logs esté disponible globalmente en toda la aplicación.

### 3. Integración en main.ts

El archivo `main.ts` configura el logger como el sistema de logs principal de la aplicación y establece un interceptor global para registrar todas las solicitudes HTTP y sus respuestas.

## Características Principales

1. **Logs Diarios**: Los logs se organizan en archivos diarios con formato `YYYY-MM-DD.log`.

2. **Sanitización de Datos**: El sistema automáticamente oculta información sensible como contraseñas, tokens y datos de tarjetas.

3. **Contexto Detallado**: Cada entrada de log incluye:
   - Timestamp
   - Nivel de log (INFO, DEBUG, WARN, ERROR)
   - Contexto (nombre del módulo o servicio)
   - Mensaje
   - Detalles adicionales (para errores)

4. **Logs Específicos**:
   - **Errores de Validación**: Registra detalles sobre campos inválidos y las restricciones que no se cumplieron.
   - **Errores de Base de Datos**: Registra información sobre errores SQL, incluyendo códigos de error y detalles específicos.

## Uso en Módulos

### En Servicios

```typescript
// Inyección del servicio
constructor(
  @InjectRepository(MiEntidad)
  private miEntidadRepository: Repository<MiEntidad>,
  private logger: LoggerService
) {}

// Uso en métodos
async create(createDto: CreateDto) {
  this.logger.log(`Iniciando creación de entidad`, 'MiServicio');
  
  try {
    // Lógica de negocio
    const resultado = await this.miEntidadRepository.save(nuevaEntidad);
    this.logger.log(`Entidad creada con éxito: ID ${resultado.id}`, 'MiServicio');
    return resultado;
  } catch (error) {
    // Manejo de errores específicos
    if (error.code === '23505') { // Unique constraint violation
      this.logger.logDatabaseError(
        'Error de duplicidad al crear entidad',
        error.toString(),
        'create',
        'MiServicio'
      );
      throw new ConflictException('Ya existe un registro con estos datos');
    }
    
    // Error general
    this.logger.error(
      'Error al crear entidad',
      error.stack || error.toString(),
      'MiServicio'
    );
    throw new InternalServerErrorException('Error al procesar la solicitud');
  }
}
```

### En Controladores

```typescript
// Inyección del servicio
constructor(
  private miServicio: MiServicio,
  private logger: LoggerService
) {}

// Uso en endpoints
@Post()
async create(@Body() createDto: CreateDto) {
  this.logger.log(`Solicitud recibida para crear entidad: ${JSON.stringify(createDto)}`, 'MiControlador');
  
  try {
    const resultado = await this.miServicio.create(createDto);
    this.logger.log(`Entidad creada exitosamente`, 'MiControlador');
    return {
      success: true,
      data: resultado
    };
  } catch (error) {
    this.logger.error(
      `Error al procesar solicitud de creación`,
      error.stack || error.toString(),
      'MiControlador'
    );
    throw error; // El filtro global HttpExceptionFilter manejará la respuesta
  }
}
```

## Mejores Prácticas

1. **Siempre proporcionar un contexto**: Usar el nombre del servicio o controlador como segundo parámetro en los métodos de log.

2. **Registrar inicio y fin de operaciones importantes**: Especialmente para operaciones que modifican datos.

3. **Detallar errores**: Incluir información suficiente para identificar la causa del error.

4. **Evitar información sensible**: No incluir contraseñas, tokens completos o datos personales en los logs.

5. **Usar el nivel adecuado**: 
   - `log` para información general
   - `debug` para detalles que solo son útiles durante el desarrollo
   - `warn` para situaciones anómalas pero no críticas
   - `error` para problemas que requieren atención

6. **Usar métodos específicos**: Utilizar `logValidationError` y `logDatabaseError` para esos tipos específicos de errores.

## Configuración

El sistema de logs está configurado globalmente en `main.ts` y no requiere configuración adicional en los módulos individuales. Solo es necesario inyectar el `LoggerService` en los constructores de los servicios y controladores donde se necesite.

## Ejemplo de Implementación

El módulo de ventas de saldo (`balance-sales`) implementa completamente este sistema de logs y puede servir como referencia para otros módulos.

## Mantenimiento

Los archivos de log se acumulan en la carpeta `logs/`. Se recomienda implementar una política de rotación de logs para evitar que ocupen demasiado espacio en disco en entornos de producción.

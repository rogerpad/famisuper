import { LoggerService } from './common/services/logger.service';

/**
 * Script para probar el sistema de logs con diferentes escenarios de error
 * Este script simula diferentes situaciones de error y verifica que se registren correctamente
 */
async function testLogger() {
  console.log('Iniciando pruebas del sistema de logs...');
  
  // Crear instancia del logger
  const logger = new LoggerService();
  logger.log('Iniciando pruebas de logging', 'TestLogger');
  
  // Simular diferentes niveles de log
  logger.log('Este es un mensaje de información', 'TestLogger');
  logger.debug('Este es un mensaje de depuración', 'TestLogger');
  logger.warn('Este es un mensaje de advertencia', 'TestLogger');
  logger.error('Este es un mensaje de error', 'Error simulado', 'TestLogger');
  
  // Simular logs específicos
  logger.logValidationError(
    'Error de validación simulado',
    {
      message: 'Error de validación simulado',
      errors: [
        { property: 'usuarioId', constraints: { isNumber: 'usuarioId debe ser un número' } },
        { property: 'monto', constraints: { min: 'monto debe ser mayor que 0' } }
      ]
    },
    'TestLogger'
  );
  
  logger.logDatabaseError(
    'Error de base de datos simulado',
    new Error('Violación de constraint unique_venta_saldo').toString(),
    'create',
    'TestLogger'
  );
  
  // Simular errores con datos sensibles
  logger.debug('Datos con información sensible: ' + 
    JSON.stringify({
      usuario: 'admin',
      password: 'secreto123',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      tarjeta: '1234-5678-9012-3456'
    }), 
    'TestLogger'
  );
  
  // Simular errores comunes
  try {
    throw new Error('Error genérico simulado');
  } catch (error) {
    logger.error(
      'Error capturado en la aplicación',
      error.stack || error.toString(),
      'TestLogger'
    );
  }
  
  // Simular error de base de datos
  try {
    const dbError = new Error('Error de conexión a la base de datos');
    dbError['code'] = '23505'; // Código de error de PostgreSQL para violación de unique constraint
    dbError['detail'] = 'Key (usuario_id, telefonica_id)=(1, 2) already exists.';
    throw dbError;
  } catch (error) {
    logger.logDatabaseError(
      'Error al insertar registro en la base de datos',
      error.toString(),
      'create',
      'TestLogger'
    );
  }
  
  console.log('\nPruebas completadas. Verifique los archivos de log en la carpeta logs/');
}

// Ejecutar las pruebas
testLogger()
  .then(() => console.log('Pruebas finalizadas'))
  .catch(error => console.error('Error en las pruebas:', error));

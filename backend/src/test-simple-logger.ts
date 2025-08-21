import { LoggerService } from './common/services/logger.service';

/**
 * Script simple para probar el sistema de logs
 */
async function testSimpleLogger() {
  console.log('Iniciando prueba simple del sistema de logs...');
  
  // Crear instancia del logger
  const logger = new LoggerService();
  
  // Probar diferentes niveles de log
  logger.log('Mensaje de información de prueba', 'TestSimple');
  logger.debug('Mensaje de depuración de prueba', 'TestSimple');
  logger.warn('Mensaje de advertencia de prueba', 'TestSimple');
  logger.error('Mensaje de error de prueba', 'Error simulado', 'TestSimple');
  
  console.log('Prueba simple completada. Verifique los archivos de log en la carpeta logs/');
}

// Ejecutar la prueba simple
testSimpleLogger()
  .then(() => console.log('Prueba finalizada'))
  .catch(error => console.error('Error en la prueba:', error));

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FormulaConfigsService } from '../modules/formula-configs/formula-configs.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const formulaConfigsService = app.get(FormulaConfigsService);
    
    // ID del proveedor "EFECTIVO AGENTE" (ajustar si es necesario)
    const EFECTIVO_AGENTE_ID = 9;
    
    console.log(`Verificando configuraciones para EFECTIVO AGENTE (ID: ${EFECTIVO_AGENTE_ID})...`);
    
    // Obtener configuraciones
    const configs = await formulaConfigsService.findByProvider(EFECTIVO_AGENTE_ID);
    
    console.log(`Se encontraron ${configs.length} configuraciones para EFECTIVO AGENTE`);
    
    // Mostrar configuraciones
    configs.forEach(config => {
      console.log(`- Tipo Transacción ID: ${config.tipoTransaccionId}`);
      console.log(`  Incluir en Cálculo: ${config.incluirEnCalculo}`);
      console.log(`  Factor Multiplicador: ${config.factorMultiplicador}`);
      console.log(`  Suma Total: ${config.sumaTotal}`);
      console.log('---');
    });
    
    // Verificar configuraciones con sumaTotal activado
    const sumaTotalConfigs = configs.filter(config => config.sumaTotal && config.incluirEnCalculo);
    console.log(`Configuraciones con Suma Total activado: ${sumaTotalConfigs.length}`);
    
    if (sumaTotalConfigs.length > 0) {
      console.log('Configuraciones con Suma Total activado:');
      sumaTotalConfigs.forEach(config => {
        console.log(`- Tipo Transacción ID: ${config.tipoTransaccionId}, Factor: ${config.factorMultiplicador}`);
      });
    }
    
  } catch (error) {
    console.error('Error al verificar configuraciones:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

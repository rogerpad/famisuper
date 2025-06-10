import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormulaConfig } from './entities/formula-config.entity';
import { CreateFormulaConfigDto } from './dto/create-formula-config.dto';
import { UpdateFormulaConfigDto } from './dto/update-formula-config.dto';
import { ProvidersService } from '../providers/providers.service';
import { TransactionTypesService } from '../transaction-types/transaction-types.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class FormulaConfigsService {
  constructor(
    @InjectRepository(FormulaConfig)
    private formulaConfigsRepository: Repository<FormulaConfig>,
    private providersService: ProvidersService,
    private transactionTypesService: TransactionTypesService,
    private transactionsService: TransactionsService,
  ) {}

  async create(createFormulaConfigDto: CreateFormulaConfigDto): Promise<FormulaConfig> {
    // Verificar si el proveedor existe
    const provider = await this.providersService.findOne(createFormulaConfigDto.proveedorId);
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${createFormulaConfigDto.proveedorId} no encontrado`);
    }

    // Verificar si el tipo de transacción existe
    const transactionType = await this.transactionTypesService.findOne(createFormulaConfigDto.tipoTransaccionId);
    if (!transactionType) {
      throw new NotFoundException(`Tipo de transacción con ID ${createFormulaConfigDto.tipoTransaccionId} no encontrado`);
    }

    // Verificar si ya existe una configuración para este proveedor y tipo de transacción
    const existingConfig = await this.formulaConfigsRepository.findOne({
      where: {
        proveedorId: createFormulaConfigDto.proveedorId,
        tipoTransaccionId: createFormulaConfigDto.tipoTransaccionId,
      },
    });

    if (existingConfig) {
      throw new ConflictException(`Ya existe una configuración para este proveedor y tipo de transacción`);
    }

    // Crear la nueva configuración
    const newConfig = this.formulaConfigsRepository.create(createFormulaConfigDto);
    return this.formulaConfigsRepository.save(newConfig);
  }

  async findAll(): Promise<FormulaConfig[]> {
    return this.formulaConfigsRepository.find({
      relations: ['proveedor', 'tipoTransaccion'],
    });
  }

  async findByProvider(proveedorId: number): Promise<FormulaConfig[]> {
    return this.formulaConfigsRepository.find({
      where: { proveedorId },
      relations: ['proveedor', 'tipoTransaccion'],
    });
  }

  async findOne(id: number): Promise<FormulaConfig> {
    const config = await this.formulaConfigsRepository.findOne({
      where: { id },
      relations: ['proveedor', 'tipoTransaccion'],
    });
    
    if (!config) {
      throw new NotFoundException(`Configuración de fórmula con ID ${id} no encontrada`);
    }
    
    return config;
  }

  async update(id: number, updateFormulaConfigDto: UpdateFormulaConfigDto): Promise<FormulaConfig> {
    const config = await this.findOne(id);
    
    // Si se está cambiando el proveedor o tipo de transacción, verificar que no exista otra configuración
    if (
      (updateFormulaConfigDto.proveedorId && updateFormulaConfigDto.proveedorId !== config.proveedorId) ||
      (updateFormulaConfigDto.tipoTransaccionId && updateFormulaConfigDto.tipoTransaccionId !== config.tipoTransaccionId)
    ) {
      const existingConfig = await this.formulaConfigsRepository.findOne({
        where: {
          proveedorId: updateFormulaConfigDto.proveedorId || config.proveedorId,
          tipoTransaccionId: updateFormulaConfigDto.tipoTransaccionId || config.tipoTransaccionId,
        },
      });

      if (existingConfig && existingConfig.id !== id) {
        throw new ConflictException(`Ya existe una configuración para este proveedor y tipo de transacción`);
      }
    }
    
    // Actualizar la configuración
    await this.formulaConfigsRepository.update(id, updateFormulaConfigDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.formulaConfigsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Configuración de fórmula con ID ${id} no encontrada`);
    }
  }

  async updateBulkForProvider(
    proveedorId: number, 
    configs: { tipoTransaccionId: number; incluirEnCalculo: boolean; factorMultiplicador: number; sumaTotal: boolean }[]
  ): Promise<FormulaConfig[]> {
    // Verificar si el proveedor existe
    const provider = await this.providersService.findOne(proveedorId);
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${proveedorId} no encontrado`);
    }

    // Obtener todas las configuraciones existentes para este proveedor
    const existingConfigs = await this.findByProvider(proveedorId);
    
    // Crear un mapa para facilitar la búsqueda
    const configMap = new Map();
    existingConfigs.forEach(config => {
      configMap.set(config.tipoTransaccionId, config);
    });
    
    // Procesar cada configuración
    const results = [];
    
    for (const config of configs) {
      if (configMap.has(config.tipoTransaccionId)) {
        // Actualizar configuración existente
        const existingConfig = configMap.get(config.tipoTransaccionId);
        await this.formulaConfigsRepository.update(existingConfig.id, {
          incluirEnCalculo: config.incluirEnCalculo,
          factorMultiplicador: config.factorMultiplicador,
          sumaTotal: config.sumaTotal,
        });
        
        results.push(await this.findOne(existingConfig.id));
      } else {
        // Crear nueva configuración
        const newConfig = await this.create({
          proveedorId,
          tipoTransaccionId: config.tipoTransaccionId,
          incluirEnCalculo: config.incluirEnCalculo,
          factorMultiplicador: config.factorMultiplicador,
          sumaTotal: config.sumaTotal,
        });
        
        results.push(newConfig);
      }
    }
    
    return results;
  }

  // Método para calcular el resultado final basado en las transacciones activas y la configuración
  async calculateResultadoFinal(proveedorId: number, startDate?: string, endDate?: string): Promise<number> {
    console.log(`[FCS] ===== INICIANDO CÁLCULO RESULTADO FINAL =====`);
    console.log(`[FCS] Parámetros: proveedorId=${proveedorId}, no se filtra por fechas, se consideran todas las transacciones activas`);
    
    try {
      // Verificar si el proveedor existe
      const provider = await this.providersService.findOne(proveedorId);
      if (!provider) {
        console.error(`[FCS] Proveedor con ID ${proveedorId} no encontrado.`);
        return 0;
      }
      console.log(`[FCS] Proveedor encontrado: ${provider.nombre} (ID: ${provider.id})`);

      // Obtener las configuraciones de fórmulas para este proveedor
      const formulaConfigs = await this.findByProvider(proveedorId);
      const activeConfigs = formulaConfigs.filter(config => config.incluirEnCalculo);
      console.log(`[FCS] Configuraciones de fórmula activas encontradas: ${activeConfigs.length}`);
      
      // Mostrar todas las configuraciones activas para depuración
      activeConfigs.forEach(ac => {
        console.log(`[FCS] Config: tipoTransaccionId=${ac.tipoTransaccionId}, factor=${ac.factorMultiplicador}, sumaTotal=${ac.sumaTotal}`);
      });

      if (activeConfigs.length === 0) {
        console.log('[FCS] No hay configuraciones activas, retornando 0.');
        return 0;
      }

      let resultadoFinal = 0;

      // Separar configuraciones que usan suma total y las que no
      const sumaTotalConfigs = activeConfigs.filter(config => config.sumaTotal);
      const individualConfigs = activeConfigs.filter(config => !config.sumaTotal);
      
      console.log(`[FCS] Configuraciones con sumaTotal: ${sumaTotalConfigs.length}`);
      console.log(`[FCS] Configuraciones individuales: ${individualConfigs.length}`);

      // Procesar configuraciones con sumaTotal
      for (const config of sumaTotalConfigs) {
        console.log(`[FCS] Procesando config sumaTotal para tipoTransaccionId: ${config.tipoTransaccionId} con factor: ${config.factorMultiplicador}`);
        
        // Obtener la suma de todas las transacciones activas de este tipo sin importar el agente
        const sumOfAllTransactions = await this.transactionsService.getSumOfActiveTransactionsByType(
          config.tipoTransaccionId,
        );
        
        console.log(`[FCS] Suma total para tipo ${config.tipoTransaccionId}: ${sumOfAllTransactions}`);
        resultadoFinal += sumOfAllTransactions * config.factorMultiplicador;
        console.log(`[FCS] Resultado final parcial después de sumaTotal: ${resultadoFinal}`);
      }

      // Procesar configuraciones individuales
      if (individualConfigs.length > 0) {
        console.log('[FCS] Procesando configuraciones individuales.');
        
        // Para cada configuración individual, obtener la suma de las transacciones solo para este agente
        for (const config of individualConfigs) {
          console.log(`[FCS] Procesando config individual para tipoTransaccionId: ${config.tipoTransaccionId} con factor: ${config.factorMultiplicador}`);
          
          const sumForAgent = await this.transactionsService.getSumOfActiveTransactionsByAgentAndType(
            proveedorId,
            config.tipoTransaccionId,
          );
          
          console.log(`[FCS] Suma para agente ${proveedorId}, tipo ${config.tipoTransaccionId}: ${sumForAgent}`);
          resultadoFinal += sumForAgent * config.factorMultiplicador;
          console.log(`[FCS] Resultado final parcial después de config individual: ${resultadoFinal}`);
        }
      }

      console.log(`[FCS] Resultado final calculado: ${resultadoFinal}`);
      return resultadoFinal;
    } catch (error) {
      console.error('[FCS] Error al calcular el resultado final:', error);
      throw error;
    }
  }
}

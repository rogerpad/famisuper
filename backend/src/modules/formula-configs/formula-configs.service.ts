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
    configs: { tipoTransaccionId: number; incluirEnCalculo: boolean; factorMultiplicador: number }[]
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
        });
        
        results.push(await this.findOne(existingConfig.id));
      } else {
        // Crear nueva configuración
        const newConfig = await this.create({
          proveedorId,
          tipoTransaccionId: config.tipoTransaccionId,
          incluirEnCalculo: config.incluirEnCalculo,
          factorMultiplicador: config.factorMultiplicador,
        });
        
        results.push(newConfig);
      }
    }
    
    return results;
  }

  // Método para calcular el resultado final basado en las transacciones y la configuración
  async calculateResultadoFinal(proveedorId: number, startDate: string, endDate: string): Promise<number> {
    // Verificar si el proveedor existe
    const provider = await this.providersService.findOne(proveedorId);
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${proveedorId} no encontrado`);
    }

    // Obtener las configuraciones de fórmulas para este proveedor
    const formulaConfigs = await this.findByProvider(proveedorId);
    
    // Si no hay configuraciones, retornar 0
    if (!formulaConfigs || formulaConfigs.length === 0) {
      return 0;
    }

    // Obtener todas las transacciones del agente en el rango de fechas
    const transactions = await this.transactionsService.findByAgentAndDateRange(proveedorId, startDate, endDate);
    
    // Si no hay transacciones, retornar 0
    if (!transactions || transactions.length === 0) {
      return 0;
    }

    // Crear un mapa de configuraciones por tipo de transacción para facilitar la búsqueda
    const configMap = new Map();
    formulaConfigs.forEach(config => {
      configMap.set(config.tipoTransaccionId, config);
    });

    // Calcular el resultado final sumando o restando las transacciones según la configuración
    let resultadoFinal = 0;

    for (const transaction of transactions) {
      // Verificar si existe una configuración para este tipo de transacción
      const config = configMap.get(transaction.tipoTransaccionId);
      
      // Si existe configuración y está incluida en el cálculo
      if (config && config.incluirEnCalculo) {
        // Aplicar el factor multiplicador (1 para sumar, -1 para restar, etc.)
        resultadoFinal += transaction.valor * config.factorMultiplicador;
      }
    }

    return resultadoFinal;
  }
}

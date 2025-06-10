import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AgentClosing } from './entities/agent-closing.entity';
import { CreateAgentClosingDto } from './dto/create-agent-closing.dto';
import { UpdateAgentClosingDto } from './dto/update-agent-closing.dto';
import { Provider } from '../providers/entities/provider.entity';
import { FormulaConfigsService } from '../formula-configs/formula-configs.service';
import { TransactionsService } from '../transactions/transactions.service';
import { format } from 'date-fns';

@Injectable()
export class AgentClosingsService {
  constructor(
    @InjectRepository(AgentClosing)
    private agentClosingsRepository: Repository<AgentClosing>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
    private formulaConfigsService: FormulaConfigsService,
    private transactionsService: TransactionsService,
  ) {}

  async create(createAgentClosingDto: CreateAgentClosingDto): Promise<AgentClosing> {
    console.log(`[CS-CREATE] Iniciando creación de cierre con datos:`, JSON.stringify(createAgentClosingDto));
    try {
      // Verificar si el proveedor existe y es de tipo agente
      const provider = await this.providersRepository.findOne({
        where: { 
          id: createAgentClosingDto.proveedorId,
        },
        relations: ['tipoProveedor'],
      });

      if (!provider) {
        console.error(`[CS-CREATE] No se encontró el proveedor con ID ${createAgentClosingDto.proveedorId}`);
        throw new NotFoundException(`No se encontró el proveedor con ID ${createAgentClosingDto.proveedorId}`);
      }
      console.log(`[CS-CREATE] Proveedor encontrado: ${provider.nombre} (ID: ${provider.id})`);

      // Verificar si el proveedor es de tipo agente
      if (provider.tipoProveedor?.nombre?.toLowerCase() !== 'agente') {
        console.error(`[CS-CREATE] El proveedor seleccionado no es de tipo agente: ${provider.tipoProveedor?.nombre}`);
        throw new ConflictException(`El proveedor seleccionado no es de tipo agente`);
      }
      console.log(`[CS-CREATE] Proveedor es de tipo agente: ${provider.tipoProveedor.nombre}`);

      // Verificar si ya existe un cierre para este proveedor en la misma fecha
      const existingClosing = await this.agentClosingsRepository.findOne({
        where: {
          proveedorId: createAgentClosingDto.proveedorId,
          fechaCierre: new Date(createAgentClosingDto.fechaCierre),
        },
      });

      if (existingClosing) {
        console.error(`[CS-CREATE] Ya existe un cierre para este agente en la fecha ${createAgentClosingDto.fechaCierre}`);
        throw new ConflictException(`Ya existe un cierre para este agente en la fecha ${createAgentClosingDto.fechaCierre}`);
      }
      console.log(`[CS-CREATE] No existe cierre previo para esta fecha, continuando...`);
      
      // Calcular el resultado final basado en las transacciones y la configuración de fórmulas
      const fechaCierre = new Date(createAgentClosingDto.fechaCierre);
      const startDate = format(fechaCierre, 'yyyy-MM-01'); // Primer día del mes
      const endDate = format(fechaCierre, 'yyyy-MM-dd'); // Fecha de cierre
      
      console.log(`[CS-CREATE] Calculando resultado final para fechas: ${startDate} a ${endDate}`);
      // Calcular el resultado final
      const resultadoFinal = await this.calculateResultadoFinal(
        createAgentClosingDto.proveedorId,
        startDate,
        endDate
      );
      console.log(`[CS-CREATE] Resultado final calculado: ${resultadoFinal}`);
      
      // Calcular la diferencia
      const diferencia = createAgentClosingDto.saldoFinal - resultadoFinal;
      console.log(`[CS-CREATE] Diferencia calculada: ${diferencia} (saldoFinal: ${createAgentClosingDto.saldoFinal} - resultadoFinal: ${resultadoFinal})`);

      // Asegurarse de que adicionalCta tenga un valor predeterminado si no viene en el DTO
      if (createAgentClosingDto.adicionalCta === undefined) {
        createAgentClosingDto.adicionalCta = 0;
        console.log(`[CS-CREATE] Estableciendo adicionalCta predeterminado a 0`);
      }

      // Crear el nuevo cierre con los valores calculados
      const newClosing = this.agentClosingsRepository.create({
        ...createAgentClosingDto,
        fechaCierre: new Date(createAgentClosingDto.fechaCierre),
        resultadoFinal,
        diferencia,
      });
      console.log(`[CS-CREATE] Objeto de cierre creado:`, JSON.stringify(newClosing));
      
      const savedClosing = await this.agentClosingsRepository.save(newClosing);
      console.log(`[CS-CREATE] Cierre guardado exitosamente con ID: ${savedClosing.id}`);
      return savedClosing;
    } catch (error) {
      console.error(`[CS-CREATE] Error al crear cierre:`, error);
      throw error;
    }
  }

  async findAll(startDate?: string, endDate?: string): Promise<AgentClosing[]> {
    let whereClause = {};
    
    // Si se proporcionan fechas, filtrar por rango de fechas
    if (startDate && endDate) {
      whereClause = {
        fechaCierre: Between(new Date(startDate), new Date(endDate)),
      };
    }

    return this.agentClosingsRepository.find({
      where: whereClause,
      relations: ['proveedor'],
      order: {
        fechaCierre: 'DESC',
        proveedorId: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<AgentClosing> {
    const closing = await this.agentClosingsRepository.findOne({
      where: { id },
      relations: ['proveedor'],
    });

    if (!closing) {
      throw new NotFoundException(`No se encontró el cierre con ID ${id}`);
    }

    return closing;
  }

  async update(id: number, updateAgentClosingDto: UpdateAgentClosingDto): Promise<AgentClosing> {
    const closing = await this.findOne(id);

    // Si se está actualizando el proveedor, verificar que sea de tipo agente
    if (updateAgentClosingDto.proveedorId && updateAgentClosingDto.proveedorId !== closing.proveedorId) {
      const provider = await this.providersRepository.findOne({
        where: { 
          id: updateAgentClosingDto.proveedorId,
        },
        relations: ['tipoProveedor'],
      });

      if (!provider) {
        throw new NotFoundException(`No se encontró el proveedor con ID ${updateAgentClosingDto.proveedorId}`);
      }

      // Verificar si el proveedor es de tipo agente
      if (provider.tipoProveedor.nombre.toLowerCase() !== 'agente') {
        throw new ConflictException(`El proveedor seleccionado no es de tipo agente`);
      }
    }

    // Si se está actualizando la fecha, verificar que no exista otro cierre para el mismo proveedor en esa fecha
    if (updateAgentClosingDto.fechaCierre && 
        updateAgentClosingDto.fechaCierre.toString() !== closing.fechaCierre.toString()) {
      const existingClosing = await this.agentClosingsRepository.findOne({
        where: {
          proveedorId: updateAgentClosingDto.proveedorId || closing.proveedorId,
          fechaCierre: updateAgentClosingDto.fechaCierre ? new Date(updateAgentClosingDto.fechaCierre) : closing.fechaCierre,
        },
      });

      if (existingClosing && existingClosing.id !== id) {
        throw new ConflictException(`Ya existe un cierre para este agente en la fecha ${updateAgentClosingDto.fechaCierre}`);
      }
    }
    
    // Si se actualiza la fecha o el proveedor, recalcular el resultado final
    if (updateAgentClosingDto.fechaCierre || updateAgentClosingDto.proveedorId) {
      const proveedorId = updateAgentClosingDto.proveedorId || closing.proveedorId;
      const fechaCierre = updateAgentClosingDto.fechaCierre 
        ? new Date(updateAgentClosingDto.fechaCierre) 
        : closing.fechaCierre;
      
      const startDate = format(fechaCierre, 'yyyy-MM-01'); // Primer día del mes
      const endDate = format(fechaCierre, 'yyyy-MM-dd'); // Fecha de cierre
      
      // Calcular el resultado final
      const resultadoFinal = await this.calculateResultadoFinal(
        proveedorId,
        startDate,
        endDate
      );
      
      // Actualizar el resultado final
      updateAgentClosingDto.resultadoFinal = resultadoFinal;
      
      // Calcular la diferencia si tenemos saldoFinal
      if (updateAgentClosingDto.saldoFinal !== undefined) {
        updateAgentClosingDto.diferencia = updateAgentClosingDto.saldoFinal - resultadoFinal;
      } else if (closing.saldoFinal !== undefined) {
        updateAgentClosingDto.diferencia = closing.saldoFinal - resultadoFinal;
      }
    } else if (updateAgentClosingDto.saldoFinal !== undefined && closing.resultadoFinal !== undefined) {
      // Si solo se actualiza el saldo final, recalcular la diferencia
      updateAgentClosingDto.diferencia = updateAgentClosingDto.saldoFinal - closing.resultadoFinal;
    }

    // Actualizar el cierre
    return this.agentClosingsRepository.save({
      ...closing,
      ...updateAgentClosingDto,
      fechaCierre: updateAgentClosingDto.fechaCierre ? new Date(updateAgentClosingDto.fechaCierre) : closing.fechaCierre,
    });
  }

  async remove(id: number): Promise<void> {
    const closing = await this.findOne(id);
    await this.agentClosingsRepository.remove(closing);
  }

  // Método para obtener solo los proveedores de tipo agente
  async getAgentProviders(): Promise<Provider[]> {
    // Obtener el ID del tipo de proveedor "Agente"
    const agentTypeId = await this.getAgentTypeId();

    return this.providersRepository.find({
      where: {
        tipoProveedorId: agentTypeId,
        activo: true,
      },
      order: {
        nombre: 'ASC',
      },
    });
  }

  // Método auxiliar para obtener el ID del tipo de proveedor "Agente"
  private async getAgentTypeId(): Promise<number> {
    const result = await this.providersRepository.query(
      `SELECT id FROM tbl_tipos_proveedor WHERE LOWER(nombre) = 'agente' LIMIT 1`
    );
    
    if (result && result.length > 0) {
      return result[0].id;
    }
    
    throw new NotFoundException('No se encontró el tipo de proveedor "Agente"');
  }
  
  // Método para calcular el resultado final basado en las transacciones y la configuración de fórmulas
  async calculateResultadoFinal(proveedorId: number, startDate: string, endDate: string): Promise<number> {
    console.log(`[CS] ===== INICIANDO CÁLCULO RESULTADO FINAL =====`);
    console.log(`[CS] Parámetros: proveedorId=${proveedorId}, startDate=${startDate}, endDate=${endDate}`);
    try {
      // 1. Obtener detalles del proveedor para verificar su nombre
      const provider = await this.providersRepository.findOne({ where: { id: proveedorId } });
      if (!provider) {
        console.error(`[CS] Proveedor con ID ${proveedorId} no encontrado.`);
        return 0;
      }
      console.log(`[CS] Proveedor encontrado: ${provider.nombre} (ID: ${provider.id})`);

      // 2. Obtener las configuraciones de fórmulas para este proveedor
      const formulaConfigs = await this.formulaConfigsService.findByProvider(proveedorId);
      const activeConfigs = formulaConfigs.filter(config => config.incluirEnCalculo);
      console.log(`[CS] Configuraciones de fórmula activas encontradas: ${activeConfigs.length}`);
      
      // Mostrar todas las configuraciones activas para depuración
      activeConfigs.forEach(ac => {
        console.log(`[CS] Config: tipoTransaccionId=${ac.tipoTransaccionId}, factor=${ac.factorMultiplicador}, sumaTotal=${ac.sumaTotal}`);
      });

      if (activeConfigs.length === 0) {
        console.log('[CS] No hay configuraciones activas, retornando 0.');
        return 0;
      }

      let resultadoFinal = 0;

      // Separar configuraciones que usan suma total y las que no
      const sumaTotalConfigs = activeConfigs.filter(config => config.sumaTotal);
      const individualConfigs = activeConfigs.filter(config => !config.sumaTotal);
      
      console.log(`[CS] Configuraciones con sumaTotal: ${sumaTotalConfigs.length}`);
      console.log(`[CS] Configuraciones individuales: ${individualConfigs.length}`);

      // Procesar configuraciones con sumaTotal
      for (const config of sumaTotalConfigs) {
        console.log(`[CS] Procesando config sumaTotal para tipoTransaccionId: ${config.tipoTransaccionId} con factor: ${config.factorMultiplicador}`);
        
        // Obtener la suma de todas las transacciones de este tipo sin importar el agente
        const sumOfAllTransactions = await this.transactionsService.getSumOfActiveTransactionsByType(
          config.tipoTransaccionId,
          startDate,
          endDate,
        );
        
        console.log(`[CS] Suma total para tipo ${config.tipoTransaccionId}: ${sumOfAllTransactions}`);
        resultadoFinal += sumOfAllTransactions * config.factorMultiplicador;
        console.log(`[CS] Resultado final parcial después de sumaTotal: ${resultadoFinal}`);
      }

      // Procesar configuraciones individuales
      if (individualConfigs.length > 0) {
        console.log('[CS] Procesando configuraciones individuales.');
        const configMap = new Map<number, number>();
        individualConfigs.forEach(config => {
          configMap.set(config.tipoTransaccionId, config.factorMultiplicador);
        });

        const transactions = await this.transactionsService.findByAgentAndDateRange(
          proveedorId,
          startDate,
          endDate,
        );
        console.log(`[CS] Transacciones individuales encontradas: ${transactions.length}`);

        transactions.forEach(transaction => {
          if (configMap.has(transaction.tipoTransaccionId)) {
            resultadoFinal += transaction.valor * configMap.get(transaction.tipoTransaccionId)!;
          }
        });
      }
      
      console.log(`[CS] Resultado final calculado: ${resultadoFinal}`);
      return resultadoFinal;
    } catch (error) {
      console.error(`[CS] Error al calcular el resultado final para proveedor ${proveedorId}:`, error);
      return 0;
    }
  }
}

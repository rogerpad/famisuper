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
    // Verificar si el proveedor existe y es de tipo agente
    const provider = await this.providersRepository.findOne({
      where: { 
        id: createAgentClosingDto.proveedorId,
      },
      relations: ['tipoProveedor'],
    });

    if (!provider) {
      throw new NotFoundException(`No se encontró el proveedor con ID ${createAgentClosingDto.proveedorId}`);
    }

    // Verificar si el proveedor es de tipo agente
    if (provider.tipoProveedor.nombre.toLowerCase() !== 'agente') {
      throw new ConflictException(`El proveedor seleccionado no es de tipo agente`);
    }

    // Verificar si ya existe un cierre para este proveedor en la misma fecha
    const existingClosing = await this.agentClosingsRepository.findOne({
      where: {
        proveedorId: createAgentClosingDto.proveedorId,
        fechaCierre: new Date(createAgentClosingDto.fechaCierre),
      },
    });

    if (existingClosing) {
      throw new ConflictException(`Ya existe un cierre para este agente en la fecha ${createAgentClosingDto.fechaCierre}`);
    }
    
    // Calcular el resultado final basado en las transacciones y la configuración de fórmulas
    const fechaCierre = new Date(createAgentClosingDto.fechaCierre);
    const startDate = format(fechaCierre, 'yyyy-MM-01'); // Primer día del mes
    const endDate = format(fechaCierre, 'yyyy-MM-dd'); // Fecha de cierre
    
    // Calcular el resultado final
    const resultadoFinal = await this.calculateResultadoFinal(
      createAgentClosingDto.proveedorId,
      startDate,
      endDate
    );
    
    // Calcular la diferencia
    const diferencia = createAgentClosingDto.saldoFinal - resultadoFinal;

    // Crear el nuevo cierre con los valores calculados
    const newClosing = this.agentClosingsRepository.create({
      ...createAgentClosingDto,
      fechaCierre: new Date(createAgentClosingDto.fechaCierre),
      resultadoFinal,
      diferencia,
    });
    return this.agentClosingsRepository.save(newClosing);
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
    try {
      // Obtener las configuraciones de fórmulas para este proveedor
      const formulaConfigs = await this.formulaConfigsService.findByProvider(proveedorId);
      
      // Filtrar solo las configuraciones que están incluidas en el cálculo
      const activeConfigs = formulaConfigs.filter(config => config.incluirEnCalculo);
      
      if (activeConfigs.length === 0) {
        return 0; // No hay configuraciones activas, retornar 0
      }
      
      // Crear un mapa de tipos de transacción y sus factores multiplicadores
      const configMap = new Map<number, number>();
      activeConfigs.forEach(config => {
        configMap.set(config.tipoTransaccionId, config.factorMultiplicador);
      });
      
      // Obtener todas las transacciones del agente en el rango de fechas
      const transactions = await this.transactionsService.findByAgentAndDateRange(
        proveedorId,
        startDate,
        endDate
      );
      
      // Calcular el resultado final
      let resultadoFinal = 0;
      
      transactions.forEach(transaction => {
        // Verificar si el tipo de transacción está incluido en el cálculo
        if (configMap.has(transaction.tipoTransaccionId)) {
          // Aplicar el factor multiplicador
          resultadoFinal += transaction.valor * configMap.get(transaction.tipoTransaccionId);
        }
      });
      
      return resultadoFinal;
    } catch (error) {
      console.error('Error al calcular el resultado final:', error);
      return 0;
    }
  }
}

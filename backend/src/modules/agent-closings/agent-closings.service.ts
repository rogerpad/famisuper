import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { AgentClosing } from './entities/agent-closing.entity';
import { ClosingAdjustment } from './entities/closing-adjustment.entity';
import { AdjustClosingDto } from './dto/adjust-closing.dto';
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
    @InjectRepository(ClosingAdjustment)
    private closingAdjustmentsRepository: Repository<ClosingAdjustment>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
    private formulaConfigsService: FormulaConfigsService,
    private transactionsService: TransactionsService,
    private dataSource: DataSource,
  ) {}

  async create(createAgentClosingDto: CreateAgentClosingDto): Promise<AgentClosing> {
    console.log(`[CS-CREATE] Iniciando creación de cierre con datos:`, JSON.stringify(createAgentClosingDto, null, 2));
    console.log(`[CS-CREATE] Valores específicos recibidos:`);
    console.log(`[CS-CREATE] - resultadoFinal:`, createAgentClosingDto.resultadoFinal, typeof createAgentClosingDto.resultadoFinal);
    console.log(`[CS-CREATE] - diferencia:`, createAgentClosingDto.diferencia, typeof createAgentClosingDto.diferencia);
    
    // Verificar si el usuario tiene un turno activo
    await this.verificarTurnoActivo(createAgentClosingDto.usuarioId);
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

      // Verificar si ya existe un cierre para este proveedor en la misma fecha y turno
      // Usar la fecha directamente como string para evitar problemas de zona horaria
      console.log(`[CS-CREATE] Verificando cierres existentes para fecha ${createAgentClosingDto.fechaCierre} y turno ${createAgentClosingDto.turnoId}`);
      
      // Construir la consulta base
      const queryBuilder = this.agentClosingsRepository
        .createQueryBuilder('closing')
        .where('closing.proveedor_id = :proveedorId', { proveedorId: createAgentClosingDto.proveedorId })
        .andWhere('closing.fecha_cierre = :fechaCierre', { fechaCierre: createAgentClosingDto.fechaCierre });
      
      // Si se proporciona un turnoId, añadirlo a la consulta
      if (createAgentClosingDto.turnoId) {
        queryBuilder.andWhere('closing.turno_id = :turnoId', { turnoId: createAgentClosingDto.turnoId });
        console.log(`[CS-CREATE] Añadiendo filtro por turnoId: ${createAgentClosingDto.turnoId}`);
      } else {
        console.log(`[CS-CREATE] No se proporcionó turnoId, verificando cualquier cierre para esta fecha y agente`);
      }
      
      const existingClosing = await queryBuilder.getOne();

      if (existingClosing) {
        if (createAgentClosingDto.turnoId) {
          console.error(`[CS-CREATE] Ya existe un cierre para este agente en la fecha ${createAgentClosingDto.fechaCierre} y turno ${createAgentClosingDto.turnoId}`);
          throw new ConflictException(`Ya existe un cierre para este agente en la fecha ${createAgentClosingDto.fechaCierre} y turno ${createAgentClosingDto.turnoId}`);
        } else {
          console.error(`[CS-CREATE] Ya existe un cierre para este agente en la fecha ${createAgentClosingDto.fechaCierre}`);
          throw new ConflictException(`Ya existe un cierre para este agente en la fecha ${createAgentClosingDto.fechaCierre}. Por favor, especifique un turno diferente.`);
        }
      }
      console.log(`[CS-CREATE] No existe cierre previo para esta fecha y turno, continuando...`);
      
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

      // Crear la nueva entidad de cierre final
      // IMPORTANTE: No convertir la fecha a objeto Date para evitar desfase de zona horaria
      
      // Asegurarse de que los valores calculados se usen correctamente
      console.log(`[CS-CREATE] Preparando valores para crear entidad:`);
      console.log(`[CS-CREATE] - resultadoFinal calculado:`, resultadoFinal, typeof resultadoFinal);
      console.log(`[CS-CREATE] - diferencia calculada:`, diferencia, typeof diferencia);
      console.log(`[CS-CREATE] - resultadoFinal del DTO:`, createAgentClosingDto.resultadoFinal, typeof createAgentClosingDto.resultadoFinal);
      
      // Decidir qué valores usar para resultadoFinal y diferencia
      // Si el DTO tiene valores válidos, usarlos; de lo contrario, usar los calculados
      const finalResultadoFinal = createAgentClosingDto.resultadoFinal !== undefined && createAgentClosingDto.resultadoFinal !== null
        ? Number(createAgentClosingDto.resultadoFinal)
        : Number(resultadoFinal);
        
      const finalDiferencia = createAgentClosingDto.diferencia !== undefined && createAgentClosingDto.diferencia !== null
        ? Number(createAgentClosingDto.diferencia)
        : Number(diferencia);
      
      console.log(`[CS-CREATE] Valores finales a usar:`);
      console.log(`[CS-CREATE] - resultadoFinal final:`, finalResultadoFinal);
      console.log(`[CS-CREATE] - diferencia final:`, finalDiferencia);
      
      const newAgentClosing = this.agentClosingsRepository.create({
        ...createAgentClosingDto,
        // Asegurarse de que los campos numéricos sean números
        proveedorId: Number(createAgentClosingDto.proveedorId),
        saldoInicial: Number(createAgentClosingDto.saldoInicial) || 0,
        adicionalCta: Number(createAgentClosingDto.adicionalCta) || 0,
        resultadoFinal: finalResultadoFinal,
        saldoFinal: Number(createAgentClosingDto.saldoFinal) || 0,
        diferencia: finalDiferencia,
        // La fecha se mantiene como string en formato 'YYYY-MM-DD'
        fechaCierre: createAgentClosingDto.fechaCierre,
      });
      
      console.log(`[CS-CREATE] Entidad de cierre creada:`, JSON.stringify(newAgentClosing, null, 2));
      console.log(`[CS-CREATE] Guardando en base de datos...`);
      
      const savedClosing = await this.agentClosingsRepository.save(newAgentClosing);
      console.log(`[CS-CREATE] Cierre guardado exitosamente con ID: ${savedClosing.id}`);
      return savedClosing;
    } catch (error) {
      console.error(`[CS-CREATE] Error al crear cierre:`, error);
      throw error;
    }
  }
  
  /**
   * Verifica si el usuario tiene un turno activo asignado
   * @param usuarioId ID del usuario
   * @throws UnauthorizedException si el usuario no tiene un turno activo
   */
  private async verificarTurnoActivo(usuarioId: number): Promise<void> {
    console.log(`[CS] Verificando turno activo para usuario ${usuarioId}`);
    
    try {
      // Consultar si el usuario tiene un turno activo en tbl_usuarios_turnos
      const turnoActivo = await this.dataSource
        .createQueryBuilder()
        .select('ut.usuario_id')
        .from('tbl_usuarios_turnos', 'ut')
        .where('ut.usuario_id = :usuarioId', { usuarioId })
        .andWhere('ut.activo = :activo', { activo: true })
        .getRawOne();
      
      if (!turnoActivo) {
        console.log(`[CS] El usuario ${usuarioId} no tiene un turno activo asignado`);
        throw new UnauthorizedException('No puede crear cierres sin un turno activo. Por favor, active un turno primero.');
      }
      
      console.log(`[CS] Usuario ${usuarioId} tiene turno activo`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error(`[CS] Error al verificar turno activo: ${error.message}`);
      throw new BadRequestException(`Error al verificar turno activo: ${error.message}`);
    }
  }

  async findAll(startDate?: string, endDate?: string): Promise<AgentClosing[]> {
    console.log(`[CS-FINDALL] Buscando cierres entre ${startDate || 'inicio'} y ${endDate || 'fin'}`);
    
    // Usar QueryBuilder para evitar problemas de zona horaria con las fechas
    const queryBuilder = this.agentClosingsRepository
      .createQueryBuilder('closing')
      .leftJoinAndSelect('closing.proveedor', 'proveedor')
      .orderBy('closing.fecha_cierre', 'DESC')
      .addOrderBy('closing.proveedor_id', 'ASC');
    
    // Si se proporcionan fechas, filtrar por rango de fechas usando strings directamente
    if (startDate && endDate) {
      console.log(`[CS-FINDALL] Aplicando filtro de fechas: ${startDate} a ${endDate}`);
      queryBuilder
        .andWhere('closing.fecha_cierre >= :startDate', { startDate })
        .andWhere('closing.fecha_cierre <= :endDate', { endDate });
    }

    return queryBuilder.getMany();
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

    // Si se está actualizando la fecha, verificar que no exista otro cierre para el mismo proveedor en esa fecha y turno
    if (updateAgentClosingDto.fechaCierre) {
      console.log(`[CS-UPDATE] Verificando cierres existentes para fecha ${updateAgentClosingDto.fechaCierre} y turno ${updateAgentClosingDto.turnoId || closing.turnoId}`);
      
      // Construir la consulta base
      const queryBuilder = this.agentClosingsRepository
        .createQueryBuilder('closing')
        .where('closing.proveedor_id = :proveedorId', { 
          proveedorId: updateAgentClosingDto.proveedorId || closing.proveedorId 
        })
        .andWhere('closing.fecha_cierre = :fechaCierre', { fechaCierre: updateAgentClosingDto.fechaCierre })
        .andWhere('closing.id != :id', { id });
      
      // Si se proporciona o existe un turnoId, añadirlo a la consulta
      const turnoId = updateAgentClosingDto.turnoId || closing.turnoId;
      if (turnoId) {
        queryBuilder.andWhere('closing.turno_id = :turnoId', { turnoId });
        console.log(`[CS-UPDATE] Añadiendo filtro por turnoId: ${turnoId}`);
      } else {
        console.log(`[CS-UPDATE] No se proporcionó turnoId, verificando cualquier cierre para esta fecha y agente`);
      }
      
      const existingClosing = await queryBuilder.getOne();

      if (existingClosing) {
        if (turnoId) {
          console.error(`[CS-UPDATE] Ya existe otro cierre para este agente en la fecha ${updateAgentClosingDto.fechaCierre} y turno ${turnoId}`);
          throw new ConflictException(`Ya existe otro cierre para este agente en la fecha ${updateAgentClosingDto.fechaCierre} y turno ${turnoId}`);
        } else {
          console.error(`[CS-UPDATE] Ya existe otro cierre para este agente en la fecha ${updateAgentClosingDto.fechaCierre}`);
          throw new ConflictException(`Ya existe otro cierre para este agente en la fecha ${updateAgentClosingDto.fechaCierre}. Por favor, especifique un turno diferente.`);
        }
      }
    }
    
    // Verificar si resultadoFinal viene definido explícitamente desde el frontend
    const resultadoFinalExplicito = updateAgentClosingDto.resultadoFinal !== undefined;
    console.log(`[CS-UPDATE] resultadoFinal explícito desde frontend: ${resultadoFinalExplicito ? 'SÍ' : 'NO'}`);
    
    // Si se actualiza la fecha o el proveedor Y no viene resultadoFinal explícito, recalcular el resultado final
    if ((updateAgentClosingDto.fechaCierre || updateAgentClosingDto.proveedorId) && !resultadoFinalExplicito) {
      console.log(`[CS-UPDATE] Recalculando resultadoFinal en backend porque no viene explícito desde frontend`);
      
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
      
      // Actualizar el resultado final solo si no viene explícito desde el frontend
      updateAgentClosingDto.resultadoFinal = resultadoFinal;
      console.log(`[CS-UPDATE] resultadoFinal recalculado en backend: ${resultadoFinal}`);
      
      // Calcular la diferencia si tenemos saldoFinal
      if (updateAgentClosingDto.saldoFinal !== undefined) {
        updateAgentClosingDto.diferencia = updateAgentClosingDto.saldoFinal - resultadoFinal;
      } else if (closing.saldoFinal !== undefined) {
        updateAgentClosingDto.diferencia = closing.saldoFinal - resultadoFinal;
      }
    } else if (resultadoFinalExplicito) {
      console.log(`[CS-UPDATE] Respetando resultadoFinal enviado desde frontend: ${updateAgentClosingDto.resultadoFinal}`);
      
      // Si viene resultadoFinal explícito, calcular la diferencia si tenemos saldoFinal
      if (updateAgentClosingDto.saldoFinal !== undefined) {
        updateAgentClosingDto.diferencia = updateAgentClosingDto.saldoFinal - updateAgentClosingDto.resultadoFinal;
      } else if (closing.saldoFinal !== undefined) {
        updateAgentClosingDto.diferencia = closing.saldoFinal - updateAgentClosingDto.resultadoFinal;
      }
    } else if (updateAgentClosingDto.saldoFinal !== undefined && closing.resultadoFinal !== undefined) {
      // Si solo se actualiza el saldo final, recalcular la diferencia
      updateAgentClosingDto.diferencia = updateAgentClosingDto.saldoFinal - closing.resultadoFinal;
    }

    // Actualizar el cierre
    // IMPORTANTE: Mantener la fecha como string en formato 'YYYY-MM-DD' para evitar desfase de zona horaria
    console.log(`[CS-UPDATE] Guardando cierre con fecha: ${updateAgentClosingDto.fechaCierre || format(closing.fechaCierre, 'yyyy-MM-dd')}`);
    
    // Asegurar que proveedorId se actualice correctamente si viene definido
    const proveedorIdExplicito = updateAgentClosingDto.proveedorId !== undefined;
    if (proveedorIdExplicito) {
      console.log(`[CS-UPDATE] Respetando proveedorId enviado desde frontend: ${updateAgentClosingDto.proveedorId}`);
    }
    
    // Crear un objeto de actualización limpio para evitar sobrescrituras no deseadas
    const updateData = {};
    
    // Si no se está actualizando la fecha, mantener la fecha original
    // Esto evita que la fecha interfiera con otras actualizaciones
    if (updateAgentClosingDto.fechaCierre) {
      updateData['fechaCierre'] = updateAgentClosingDto.fechaCierre;
    } else {
      updateData['fechaCierre'] = closing.fechaCierre;
    }
    
    // SOLUCIÓN ESPECÍFICA PARA PROVEEDORID
    // Si se está actualizando el proveedorId, asegurarse de que se guarde como número
    if (proveedorIdExplicito) {
      const newProveedorId = Number(updateAgentClosingDto.proveedorId);
      updateData['proveedorId'] = newProveedorId;
      console.warn(`[CS-UPDATE] PROVEEDOR ID EXPLÍCITO: ${newProveedorId} (tipo: ${typeof newProveedorId})`);
      
      // Actualizar directamente en la base de datos para asegurar que se actualice
      // PostgreSQL usa $1, $2, etc. para los parámetros, no signos de interrogación
      await this.agentClosingsRepository.query(
        `UPDATE tbl_cierre_final_agentes SET proveedor_id = $1 WHERE id = $2`,
        [newProveedorId, id]
      );
      console.warn(`[CS-UPDATE] PROVEEDOR ID ACTUALIZADO DIRECTAMENTE EN LA BASE DE DATOS`);
    }
    
    // Si se está actualizando el resultadoFinal, asegurarse de que se guarde como número
    if (resultadoFinalExplicito) {
      updateData['resultadoFinal'] = Number(updateAgentClosingDto.resultadoFinal);
      console.log(`[CS-UPDATE] Guardando resultadoFinal: ${updateData['resultadoFinal']}`);
    }
    
    // Copiar otros campos del DTO de actualización
    if (updateAgentClosingDto.saldoFinal !== undefined) {
      updateData['saldoFinal'] = Number(updateAgentClosingDto.saldoFinal);
    }
    
    if (updateAgentClosingDto.diferencia !== undefined) {
      updateData['diferencia'] = Number(updateAgentClosingDto.diferencia);
    }
    
    if (updateAgentClosingDto.adicionalCta !== undefined) {
      updateData['adicionalCta'] = Number(updateAgentClosingDto.adicionalCta);
    }
    
    if (updateAgentClosingDto.saldoInicial !== undefined) {
      updateData['saldoInicial'] = Number(updateAgentClosingDto.saldoInicial);
    }
    
    console.log(`[CS-UPDATE] Objeto final para actualizar:`, JSON.stringify(updateData, null, 2));
    
    // Guardar la actualización con los campos explícitamente definidos
    const updatedClosing = await this.agentClosingsRepository.save({
      ...closing,
      ...updateData,
    });
    
    // Verificar que el proveedor se haya actualizado correctamente
    if (proveedorIdExplicito) {
      const verifiedClosing = await this.agentClosingsRepository.findOne({
        where: { id }
      });
      console.warn(`[CS-UPDATE] VERIFICACIÓN FINAL - proveedorId en base de datos: ${verifiedClosing.proveedorId}`);
    }
    
    return updatedClosing;
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
    
    // Si no se encuentra, devolver un valor por defecto
    return 0;
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

  /**
   * Realiza un ajuste al resultado final de un cierre inactivo
   * @param id ID del cierre a ajustar
   * @param userId ID del usuario que realiza el ajuste
   * @param adjustDto Datos del ajuste (monto y justificación)
   * @returns El cierre actualizado
   */
  async adjustClosing(id: number, userId: number, adjustDto: AdjustClosingDto): Promise<AgentClosing> {
    console.log(`[CS-ADJUST] Iniciando ajuste para cierre ${id} por usuario ${userId}`);
    console.log(`[CS-ADJUST] Datos recibidos:`, JSON.stringify(adjustDto));
    
    try {
      // Buscar el cierre
      const closing = await this.findOne(id);
      
      // Verificar que el cierre esté inactivo
      if (closing.estado !== false) {
        console.error(`[CS-ADJUST] El cierre ${id} no está inactivo, estado actual: ${closing.estado}`);
        throw new ConflictException('Solo se pueden ajustar cierres inactivos');
      }

      // Asegurarse de que los valores sean números válidos
      const adjustmentAmount = adjustDto.adjustmentAmount !== null && adjustDto.adjustmentAmount !== undefined 
        ? Number(adjustDto.adjustmentAmount) 
        : 0;

      // Guardar el resultado final anterior
      const previousFinalResult = closing.resultadoFinal !== null && closing.resultadoFinal !== undefined 
        ? Number(closing.resultadoFinal) 
        : 0;
      
      // Calcular el nuevo resultado final
      const newFinalResult = previousFinalResult + adjustmentAmount;
      console.log(`[CS-ADJUST] Resultado final anterior: ${previousFinalResult}, ajuste: ${adjustmentAmount}, nuevo: ${newFinalResult}`);
      
      // Obtener el saldo final para calcular diferencias
      const saldoFinal = closing.saldoFinal !== null && closing.saldoFinal !== undefined 
        ? Number(closing.saldoFinal) 
        : 0;
      
      // Calcular diferencia anterior y nueva
      const previousDifference = saldoFinal - previousFinalResult;
      const newDifference = saldoFinal - newFinalResult;
      
      console.log(`[CS-ADJUST] Saldo final: ${saldoFinal}`);
      console.log(`[CS-ADJUST] Diferencia anterior: ${previousDifference}, nueva diferencia: ${newDifference}`);
      
      // Crear registro de ajuste primero para asegurar que se guarde
      console.log(`[CS-ADJUST] Creando objeto de ajuste para cierre ${id} y usuario ${userId}`);
      const adjustment = new ClosingAdjustment();
      adjustment.closingId = id;
      adjustment.userId = userId;
      adjustment.adjustmentAmount = adjustmentAmount;
      adjustment.previousFinalResult = previousFinalResult;
      adjustment.newFinalResult = newFinalResult;
      adjustment.previousDifference = previousDifference;
      adjustment.newDifference = newDifference;
      adjustment.justification = adjustDto.justification || '';
      adjustment.createdAt = new Date(); // Asignar explícitamente la fecha de creación
      
      console.log(`[CS-ADJUST] Objeto de ajuste creado:`, JSON.stringify(adjustment));
      
      // Guardar el registro de ajuste antes de actualizar el cierre
      console.log(`[CS-ADJUST] Intentando guardar el registro de ajuste en la base de datos...`);
      let savedAdjustment;
      try {
        savedAdjustment = await this.closingAdjustmentsRepository.save(adjustment);
        console.log(`[CS-ADJUST] Registro de ajuste guardado correctamente con ID: ${savedAdjustment.id}`);
      } catch (adjustmentError) {
        console.error(`[CS-ADJUST] Error al guardar el registro de ajuste:`, adjustmentError);
        console.error(`[CS-ADJUST] Detalles del error:`, JSON.stringify(adjustmentError, Object.getOwnPropertyNames(adjustmentError)));
        throw new Error(`Error al guardar el registro de ajuste: ${adjustmentError.message}`);
      }
      
      // Actualizar el resultado final y la diferencia en el cierre
      closing.resultadoFinal = newFinalResult;
      closing.diferencia = newDifference;
      
      // Guardar el cierre actualizado
      const updatedClosing = await this.agentClosingsRepository.save(closing);
      console.log(`[CS-ADJUST] Cierre ${id} actualizado correctamente`);
      
      return updatedClosing;
    } catch (error) {
      console.error(`[CS-ADJUST] Error al realizar ajuste para cierre ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de ajustes de un cierre
   * @param closingId ID del cierre
   * @returns Lista de ajustes realizados al cierre
   */
  async getClosingAdjustments(closingId: number): Promise<ClosingAdjustment[]> {
    console.log(`[CS-ADJUST] Obteniendo historial de ajustes para cierre ${closingId}`);
    
    try {
      // Verificar que el cierre existe
      await this.findOne(closingId);
      
      // Buscar todos los ajustes asociados a este cierre
      const adjustments = await this.closingAdjustmentsRepository.find({
        where: { closingId },
        relations: ['user'],
        order: { createdAt: 'DESC' }
      });
      
      console.log(`[CS-ADJUST] ${adjustments.length} ajustes encontrados para cierre ${closingId}`);
      return adjustments;
    } catch (error) {
      console.error(`[CS-ADJUST] Error al obtener ajustes para cierre ${closingId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de todos los cierres asociados a un turno específico
   * @param turnoId ID del turno
   * @param estado Nuevo estado para los cierres (true para activo, false para inactivo)
   */
  async updateClosingStatusByTurno(turnoId: number, estado: boolean): Promise<void> {
    console.log(`[CS-UPDATE-STATUS] Actualizando estado a "${estado}" para cierres del turno ${turnoId}`);
    
    try {
      // Validar que el turnoId sea un número válido
      if (!turnoId || isNaN(Number(turnoId))) {
        console.error(`[CS-UPDATE-STATUS] ID de turno inválido: ${turnoId}`);
        throw new Error(`ID de turno inválido: ${turnoId}`);
      }
      
      // Actualizar todos los cierres asociados al turno especificado
      const result = await this.agentClosingsRepository
        .createQueryBuilder()
        .update(AgentClosing)
        .set({ estado: estado })
        .where('turno_id = :turnoId', { turnoId })
        .execute();
      
      console.log(`[CS-UPDATE-STATUS] ${result.affected} cierres actualizados a estado "${estado}"`);
    } catch (error) {
      console.error(`[CS-UPDATE-STATUS] Error al actualizar estado de cierres:`, error);
      throw error;
    }
  }
}

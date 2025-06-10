import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ProvidersService } from '../providers/providers.service';
import { TransactionTypesService } from '../transaction-types/transaction-types.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private providersService: ProvidersService,
    private transactionTypesService: TransactionTypesService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    // Verificar si el agente existe
    const agente = await this.providersService.findOne(createTransactionDto.agenteId);
    
    // Verificar si el tipo de transacción existe
    const tipoTransaccion = await this.transactionTypesService.findOne(createTransactionDto.tipoTransaccionId);
    
    // Procesar la fecha correctamente para evitar problemas con zona horaria
    // Formato esperado: YYYY-MM-DD
    const [year, month, day] = createTransactionDto.fecha.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // Mes es 0-indexed en JavaScript
    
    console.log(`[TS] Fecha original: ${createTransactionDto.fecha}`);
    console.log(`[TS] Fecha procesada: ${fecha.toISOString()}`);
    
    // Crear la nueva transacción
    const newTransaction = this.transactionsRepository.create({
      ...createTransactionDto,
      fecha: fecha,
      // Asegurar que el estado sea 1 (activo)
      estado: 1,
    });

    return this.transactionsRepository.save(newTransaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: {
        estado: 1, // Solo transacciones activas
      },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        id: 'DESC',
      },
    });
  }

  async findAllWithInactive(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        id: 'DESC',
      },
    });
  }
  
  async getTransactionsForSummary(): Promise<Transaction[]> {
    // Método específico para el resumen que garantiza solo transacciones activas
    return this.transactionsRepository.find({
      where: {
        estado: 1, // Estrictamente solo transacciones activas
      },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        fecha: 'DESC',
        hora: 'DESC',
      },
    });
  }
  
  async getTransactionsByDateRangeForSummary(startDate: string, endDate: string): Promise<Transaction[]> {
    // Procesar fechas correctamente para evitar problemas con zona horaria
    // Formato esperado: YYYY-MM-DD
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    console.log(`[TS] getTransactionsByDateRangeForSummary - Fecha inicio original: ${startDate}, procesada: ${start.toISOString()}`);
    console.log(`[TS] getTransactionsByDateRangeForSummary - Fecha fin original: ${endDate}, procesada: ${end.toISOString()}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    
    // Método específico para el resumen por rango de fechas que garantiza solo transacciones activas
    return this.transactionsRepository.find({
      where: {
        fecha: Between(start, end),
        estado: 1, // Estrictamente solo transacciones activas
      },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        fecha: 'DESC',
        hora: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transacción con ID ${id} no encontrada`);
    }

    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    // Verificar si la transacción existe
    await this.findOne(id);
    
    // Si se actualiza el agente, verificar que exista
    if (updateTransactionDto.agenteId) {
      await this.providersService.findOne(updateTransactionDto.agenteId);
    }
    
    // Si se actualiza el tipo de transacción, verificar que exista
    if (updateTransactionDto.tipoTransaccionId) {
      await this.transactionTypesService.findOne(updateTransactionDto.tipoTransaccionId);
    }
    
    // Si se actualiza la fecha, procesarla correctamente
    let fechaProcesada: Date | undefined;
    if (updateTransactionDto.fecha) {
      // Formato esperado: YYYY-MM-DD
      const [year, month, day] = updateTransactionDto.fecha.split('-').map(Number);
      fechaProcesada = new Date(year, month - 1, day); // Mes es 0-indexed en JavaScript
      
      console.log(`[TS] Actualización - Fecha original: ${updateTransactionDto.fecha}`);
      console.log(`[TS] Actualización - Fecha procesada: ${fechaProcesada.toISOString()}`);
    }
    
    // Preparar los datos para actualizar
    const updateData: any = { ...updateTransactionDto };
    
    // Si se procesó la fecha, asignarla al objeto de actualización
    if (fechaProcesada) {
      updateData.fecha = fechaProcesada;
    }
    
    // Actualizar la transacción
    await this.transactionsRepository.update(id, updateData);
    
    // Retornar la transacción actualizada
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Verificar si la transacción existe
    await this.findOne(id);
    
    // Eliminar la transacción
    await this.transactionsRepository.delete(id);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    // Procesar fechas correctamente para evitar problemas con zona horaria
    // Formato esperado: YYYY-MM-DD
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    console.log(`[TS] findByDateRange - Fecha inicio original: ${startDate}, procesada: ${start.toISOString()}`);
    console.log(`[TS] findByDateRange - Fecha fin original: ${endDate}, procesada: ${end.toISOString()}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    
    return this.transactionsRepository.find({
      where: {
        fecha: Between(start, end),
        estado: 1, // Solo transacciones activas
      },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        fecha: 'DESC',
        hora: 'DESC',
      },
    });
  }

  async findByAgent(agenteId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: {
        agenteId,
        estado: 1, // Solo transacciones activas
      },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        fecha: 'DESC',
        hora: 'DESC',
      },
    });
  }

  async findByTransactionType(tipoTransaccionId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: {
        tipoTransaccionId,
        estado: 1, // Solo transacciones activas
      },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        fecha: 'DESC',
        hora: 'DESC',
      },
    });
  }

  async findByAgentAndDateRange(agenteId: number, startDate: string, endDate: string): Promise<Transaction[]> {
    // Procesar fechas correctamente para evitar problemas con zona horaria
    // Formato esperado: YYYY-MM-DD
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    console.log(`[TS] findByAgentAndDateRange - Fecha inicio original: ${startDate}, procesada: ${start.toISOString()}`);
    console.log(`[TS] findByAgentAndDateRange - Fecha fin original: ${endDate}, procesada: ${end.toISOString()}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    
    return this.transactionsRepository.find({
      where: {
        agenteId,
        fecha: Between(start, end),
        estado: 1, // Solo transacciones activas
      },
      relations: ['usuario', 'agente', 'tipoTransaccion'],
      order: {
        fecha: 'DESC',
        hora: 'DESC',
      },
    });
  }

  /**
   * Obtiene la suma de todas las transacciones activas de un tipo específico para un agente específico
   * sin filtrar por fechas
   */
  async getSumOfActiveTransactionsByAgentAndType(
    agenteId: number,
    tipoTransaccionId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    console.log(`[TS] Iniciando getSumOfActiveTransactionsByAgentAndType - agenteId: ${agenteId}, tipoTransaccionId: ${tipoTransaccionId}`);
    console.log(`[TS] No se filtra por fechas, se consideran todas las transacciones activas`);

    // Primero, veamos cuántas transacciones hay que cumplan estos criterios
    const transactionsCount = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.agenteId = :agenteId', { agenteId })
      .andWhere('transaction.tipoTransaccionId = :tipoTransaccionId', { tipoTransaccionId })
      .andWhere('transaction.estado = :estado', { estado: 1 }) // Solo transacciones activas
      .getCount();
    
    console.log(`[TS] Encontradas ${transactionsCount} transacciones que cumplen los criterios`);
    
    // Ahora obtenemos la suma
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.valor)', 'total')
      .where('transaction.agenteId = :agenteId', { agenteId })
      .andWhere('transaction.tipoTransaccionId = :tipoTransaccionId', { tipoTransaccionId })
      .andWhere('transaction.estado = :estado', { estado: 1 }); // Solo transacciones activas
    
    // Obtener la consulta SQL generada para depuración
    const sqlQuery = queryBuilder.getSql();
    console.log(`[TS] Consulta SQL generada: ${sqlQuery}`);
    console.log(`[TS] Parámetros: `, { agenteId, tipoTransaccionId, estado: 1 });
    
    const result = await queryBuilder.getRawOne();
    console.log(`[TS] Resultado de la consulta:`, result);
    
    const total = parseFloat(result?.total) || 0;
    console.log(`[TS] Total calculado: ${total}`);
    
    return total;
  }
  
  /**
   * Obtiene la suma de todas las transacciones activas de un tipo específico
   * sin filtrar por fechas, sin importar el agente
   */
  async getSumOfActiveTransactionsByType(
    tipoTransaccionId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    console.log(`[TS] Iniciando getSumOfActiveTransactionsByType - tipoTransaccionId: ${tipoTransaccionId}`);
    console.log(`[TS] No se filtra por fechas, se consideran todas las transacciones activas`);

    // Primero, veamos cuántas transacciones hay que cumplan estos criterios
    const transactionsCount = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.tipoTransaccionId = :tipoTransaccionId', { tipoTransaccionId })
      .andWhere('transaction.estado = :estado', { estado: 1 }) // Solo transacciones activas
      .getCount();
    
    console.log(`[TS] Encontradas ${transactionsCount} transacciones que cumplen los criterios`);
    
    // Ahora obtenemos la suma
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.valor)', 'total')
      .where('transaction.tipoTransaccionId = :tipoTransaccionId', { tipoTransaccionId })
      .andWhere('transaction.estado = :estado', { estado: 1 }); // Solo transacciones activas
    
    // Obtener la consulta SQL generada para depuración
    const sqlQuery = queryBuilder.getSql();
    console.log(`[TS] Consulta SQL generada para suma total: ${sqlQuery}`);
    console.log(`[TS] Parámetros: `, { tipoTransaccionId, estado: 1 });
    
    const result = await queryBuilder.getRawOne();
    console.log(`[TS] Resultado de la consulta suma total:`, result);
    
    const total = parseFloat(result?.total) || 0;
    console.log(`[TS] Total calculado para suma total: ${total}`);
    
    return total;
  }
}

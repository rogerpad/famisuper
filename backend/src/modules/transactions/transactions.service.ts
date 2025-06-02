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
    
    // Crear la nueva transacción
    const newTransaction = this.transactionsRepository.create({
      ...createTransactionDto,
      // Convertir la fecha de string a Date si es necesario
      fecha: new Date(createTransactionDto.fecha),
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    
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

    // Preparar los datos para actualizar
    const updateData: any = { ...updateTransactionDto };
    
    // Convertir la fecha de string a Date si está presente
    if (updateTransactionDto.fecha) {
      updateData.fecha = new Date(updateTransactionDto.fecha);
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    
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
}

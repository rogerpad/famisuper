import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TransactionType } from './entities/transaction-type.entity';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';

@Injectable()
export class TransactionTypesService {
  constructor(
    @InjectRepository(TransactionType)
    private transactionTypesRepository: Repository<TransactionType>,
    private dataSource: DataSource,
  ) {}

  async create(createTransactionTypeDto: CreateTransactionTypeDto): Promise<TransactionType> {
    // Verificar si ya existe un tipo de transacción con el mismo nombre
    const existingType = await this.transactionTypesRepository.findOne({
      where: { nombre: createTransactionTypeDto.nombre },
    });

    if (existingType) {
      throw new ConflictException(`El tipo de transacción con nombre ${createTransactionTypeDto.nombre} ya existe`);
    }

    // Obtener el siguiente ID disponible
    const maxIdResult = await this.transactionTypesRepository.query('SELECT MAX(id) as max_id FROM tbl_tipos_transaccion');
    const nextId = maxIdResult[0].max_id ? parseInt(maxIdResult[0].max_id) + 1 : 1;
    
    // Crear el nuevo tipo de transacción
    const newTransactionType = this.transactionTypesRepository.create({
      id: nextId,
      ...createTransactionTypeDto,
      activo: createTransactionTypeDto.activo !== undefined ? createTransactionTypeDto.activo : true,
    });

    return this.transactionTypesRepository.save(newTransactionType);
  }

  async findAll(): Promise<TransactionType[]> {
    return this.transactionTypesRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<TransactionType> {
    const transactionType = await this.transactionTypesRepository.findOne({
      where: { id },
    });

    if (!transactionType) {
      throw new NotFoundException(`Tipo de transacción con ID ${id} no encontrado`);
    }

    return transactionType;
  }

  async update(id: number, updateTransactionTypeDto: UpdateTransactionTypeDto): Promise<TransactionType> {
    // Verificar si el tipo de transacción existe
    const transactionType = await this.findOne(id);

    // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
    if (updateTransactionTypeDto.nombre && updateTransactionTypeDto.nombre !== transactionType.nombre) {
      const existingType = await this.transactionTypesRepository.findOne({
        where: { nombre: updateTransactionTypeDto.nombre },
      });

      if (existingType) {
        throw new ConflictException(`El tipo de transacción con nombre ${updateTransactionTypeDto.nombre} ya existe`);
      }
    }

    // Actualizar el tipo de transacción
    await this.transactionTypesRepository.update(id, updateTransactionTypeDto);
    
    // Retornar el tipo de transacción actualizado
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Verificar si el tipo de transacción existe
    await this.findOne(id);
    
    // Verificar si el tipo de transacción está siendo utilizado en configuración de fórmulas
    const formulaConfigCount = await this.dataSource.query(
      `SELECT COUNT(*) FROM tbl_configuracion_formulas WHERE tipo_transaccion_id = $1`,
      [id]
    );
    
    if (parseInt(formulaConfigCount[0].count) > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de transacción porque está siendo utilizado en ${formulaConfigCount[0].count} configuraciones de fórmulas`
      );
    }
    
    // Verificar si el tipo de transacción está siendo utilizado en transacciones
    const transactionsCount = await this.dataSource.query(
      `SELECT COUNT(*) FROM tbl_transacciones_agentes WHERE tipo_transaccion_id = $1`,
      [id]
    );
    
    if (parseInt(transactionsCount[0].count) > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de transacción porque está siendo utilizado en ${transactionsCount[0].count} transacciones`
      );
    }
    
    // Eliminar el tipo de transacción
    await this.transactionTypesRepository.delete(id);
  }

  async findActive(): Promise<TransactionType[]> {
    return this.transactionTypesRepository.find({
      where: { activo: true },
      order: {
        nombre: 'ASC',
      },
    });
  }
}

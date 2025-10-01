import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperExpenseType } from '../entities/super-expense-type.entity';
import { CreateSuperExpenseTypeDto } from '../dto/create-super-expense-type.dto';
import { UpdateSuperExpenseTypeDto } from '../dto/update-super-expense-type.dto';

@Injectable()
export class SuperExpenseTypesService {
  constructor(
    @InjectRepository(SuperExpenseType)
    private superExpenseTypeRepository: Repository<SuperExpenseType>,
  ) {}

  async findAll(): Promise<SuperExpenseType[]> {
    return this.superExpenseTypeRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findAllActive(): Promise<SuperExpenseType[]> {
    return this.superExpenseTypeRepository.find({
      where: { activo: true },
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<SuperExpenseType> {
    const superExpenseType = await this.superExpenseTypeRepository.findOne({
      where: { id },
    });

    if (!superExpenseType) {
      throw new NotFoundException(`Tipo de egreso con ID ${id} no encontrado`);
    }

    return superExpenseType;
  }

  async create(createSuperExpenseTypeDto: CreateSuperExpenseTypeDto): Promise<SuperExpenseType> {
    try {
      console.log('DTO recibido en el servicio:', JSON.stringify(createSuperExpenseTypeDto));
      
      // Validar que el nombre no esté vacío
      if (!createSuperExpenseTypeDto.nombre || createSuperExpenseTypeDto.nombre.trim() === '') {
        throw new BadRequestException('El nombre del tipo de egreso es requerido');
      }
      
      // Crear objeto con solo los campos que existen en la tabla
      const newSuperExpenseType = this.superExpenseTypeRepository.create({
        nombre: createSuperExpenseTypeDto.nombre,
        descripcion: createSuperExpenseTypeDto.descripcion || null,
        activo: true
      });

      console.log('Objeto a guardar:', JSON.stringify(newSuperExpenseType));
      return await this.superExpenseTypeRepository.save(newSuperExpenseType);
    } catch (error) {
      console.error('Error detallado al crear tipo de egreso:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el tipo de egreso: ${error.message || 'Error desconocido'}`);
    }
  }

  async update(id: number, updateSuperExpenseTypeDto: UpdateSuperExpenseTypeDto): Promise<SuperExpenseType> {
    const superExpenseType = await this.findOne(id);

    try {
      // Actualizar solo los campos que existen en la tabla
      if (updateSuperExpenseTypeDto.nombre !== undefined) {
        superExpenseType.nombre = updateSuperExpenseTypeDto.nombre;
      }
      
      if (updateSuperExpenseTypeDto.descripcion !== undefined) {
        superExpenseType.descripcion = updateSuperExpenseTypeDto.descripcion;
      }
      
      console.log('Objeto a actualizar:', JSON.stringify(superExpenseType));
      return await this.superExpenseTypeRepository.save(superExpenseType);
    } catch (error) {
      console.error('Error detallado al actualizar tipo de egreso:', error);
      throw new BadRequestException(`Error al actualizar el tipo de egreso: ${error.message || 'Error desconocido'}`);
    }
  }

  async remove(id: number): Promise<void> {
    const superExpenseType = await this.findOne(id);
    
    try {
      await this.superExpenseTypeRepository.remove(superExpenseType);
    } catch (error) {
      throw new BadRequestException('Error al eliminar el tipo de egreso');
    }
  }

  async toggleStatus(id: number): Promise<SuperExpenseType> {
    const superExpenseType = await this.findOne(id);
    
    try {
      superExpenseType.activo = !superExpenseType.activo;
      return await this.superExpenseTypeRepository.save(superExpenseType);
    } catch (error) {
      throw new BadRequestException('Error al cambiar el estado del tipo de egreso');
    }
  }
}

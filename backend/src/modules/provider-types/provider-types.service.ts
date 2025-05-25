import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderType } from './entities/provider-type.entity';
import { CreateProviderTypeDto } from './dto/create-provider-type.dto';
import { UpdateProviderTypeDto } from './dto/update-provider-type.dto';

@Injectable()
export class ProviderTypesService {
  constructor(
    @InjectRepository(ProviderType)
    private providerTypesRepository: Repository<ProviderType>,
  ) {}

  async create(createProviderTypeDto: CreateProviderTypeDto): Promise<ProviderType> {
    // Verificar si ya existe un tipo de proveedor con el mismo nombre
    const existingType = await this.providerTypesRepository.findOne({
      where: { nombre: createProviderTypeDto.nombre },
    });

    if (existingType) {
      throw new ConflictException(`El tipo de proveedor con nombre ${createProviderTypeDto.nombre} ya existe`);
    }

    // Obtener el siguiente ID disponible
    const maxIdResult = await this.providerTypesRepository.query('SELECT MAX(id) as max_id FROM tbl_tipos_proveedor');
    const nextId = maxIdResult[0].max_id ? parseInt(maxIdResult[0].max_id) + 1 : 1;
    
    // Crear el nuevo tipo de proveedor
    const newProviderType = this.providerTypesRepository.create({
      id: nextId,
      ...createProviderTypeDto,
      activo: createProviderTypeDto.activo !== undefined ? createProviderTypeDto.activo : true,
    });

    return this.providerTypesRepository.save(newProviderType);
  }

  async findAll(): Promise<ProviderType[]> {
    return this.providerTypesRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<ProviderType> {
    const providerType = await this.providerTypesRepository.findOne({
      where: { id },
    });

    if (!providerType) {
      throw new NotFoundException(`Tipo de proveedor con ID ${id} no encontrado`);
    }

    return providerType;
  }

  async update(id: number, updateProviderTypeDto: UpdateProviderTypeDto): Promise<ProviderType> {
    // Verificar si el tipo de proveedor existe
    const providerType = await this.findOne(id);

    // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
    if (updateProviderTypeDto.nombre && updateProviderTypeDto.nombre !== providerType.nombre) {
      const existingType = await this.providerTypesRepository.findOne({
        where: { nombre: updateProviderTypeDto.nombre },
      });

      if (existingType) {
        throw new ConflictException(`El tipo de proveedor con nombre ${updateProviderTypeDto.nombre} ya existe`);
      }
    }

    // Actualizar el tipo de proveedor
    await this.providerTypesRepository.update(id, updateProviderTypeDto);
    
    // Retornar el tipo de proveedor actualizado
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Verificar si el tipo de proveedor existe
    await this.findOne(id);
    
    // Eliminar el tipo de proveedor
    await this.providerTypesRepository.delete(id);
  }
}

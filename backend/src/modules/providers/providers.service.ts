import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    // Verificar si ya existe un proveedor con el mismo nombre
    const existingProvider = await this.providersRepository.findOne({
      where: { nombre: createProviderDto.nombre },
    });

    if (existingProvider) {
      throw new ConflictException(`El proveedor con nombre ${createProviderDto.nombre} ya existe`);
    }

    // Obtener el siguiente ID disponible
    const maxIdResult = await this.providersRepository.query('SELECT MAX(id) as max_id FROM tbl_proveedores');
    const nextId = maxIdResult[0].max_id ? parseInt(maxIdResult[0].max_id) + 1 : 1;
    
    // Crear el nuevo proveedor
    const newProvider = this.providersRepository.create({
      id: nextId,
      ...createProviderDto,
      activo: createProviderDto.activo !== undefined ? createProviderDto.activo : true,
      fechaRegistro: new Date(),
    });

    return this.providersRepository.save(newProvider);
  }

  async findAll(): Promise<Provider[]> {
    return this.providersRepository.find({
      relations: ['tipoProveedor'],
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Provider> {
    const provider = await this.providersRepository.findOne({
      where: { id },
      relations: ['tipoProveedor'],
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    return provider;
  }

  async update(id: number, updateProviderDto: UpdateProviderDto): Promise<Provider> {
    try {
      // Verificar si el proveedor existe
      const provider = await this.findOne(id);

      // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
      if (updateProviderDto.nombre && updateProviderDto.nombre !== provider.nombre) {
        const existingProvider = await this.providersRepository.findOne({
          where: { nombre: updateProviderDto.nombre },
        });

        if (existingProvider) {
          throw new ConflictException(`El proveedor con nombre ${updateProviderDto.nombre} ya existe`);
        }
      }

      // Crear un objeto limpio para la actualización
      const updateData: any = {};
      
      // Solo incluir los campos que realmente se están actualizando
      if (updateProviderDto.nombre !== undefined) updateData.nombre = updateProviderDto.nombre;
      if (updateProviderDto.tipoProveedorId !== undefined) updateData.tipoProveedorId = updateProviderDto.tipoProveedorId;
      
      // Manejar campos opcionales que pueden ser nulos o cadenas vacías
      if ('rtn' in updateProviderDto) updateData.rtn = updateProviderDto.rtn || null;
      if ('telefono' in updateProviderDto) updateData.telefono = updateProviderDto.telefono || null;
      if ('contacto' in updateProviderDto) updateData.contacto = updateProviderDto.contacto || null;
      if ('notas' in updateProviderDto) updateData.notas = updateProviderDto.notas || null;
      
      if (updateProviderDto.activo !== undefined) updateData.activo = updateProviderDto.activo;
      
      // Actualizar solo los campos proporcionados
      await this.providersRepository.update(id, updateData);
      
      // Retornar el proveedor actualizado
      return this.findOne(id);
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    // Verificar si el proveedor existe
    await this.findOne(id);
    
    // Eliminar el proveedor
    await this.providersRepository.delete(id);
  }

  async findByType(tipoProveedorId: number): Promise<Provider[]> {
    return this.providersRepository.find({
      where: { tipoProveedorId },
      relations: ['tipoProveedor'],
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findActive(): Promise<Provider[]> {
    return this.providersRepository.find({
      where: { activo: true },
      relations: ['tipoProveedor'],
      order: {
        nombre: 'ASC',
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    console.log(`[PackagesService] Iniciando creación de paquete`);
    console.log(`[PackagesService] Datos recibidos:`, JSON.stringify(createPackageDto));
    
    try {
      // Funciones de utilidad para conversión segura de tipos
      const safeParseInt = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseInt(String(value).trim()) || 0;
      };
      
      const safeParseFloat = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseFloat(String(value).trim()) || 0;
      };
      
      // Crear un objeto limpio con los datos convertidos explícitamente
      const cleanedData = {
        nombre: createPackageDto.nombre?.trim(),
        descripcion: createPackageDto.descripcion?.trim() || '',
        telefonicaId: safeParseInt(createPackageDto.telefonicaId),
        precio: safeParseFloat(createPackageDto.precio),
        activo: createPackageDto.activo !== undefined ? Boolean(createPackageDto.activo) : true
      };
      
      console.log(`[PackagesService] Datos procesados:`, JSON.stringify(cleanedData));
      
      // Crear y guardar la entidad usando el objeto limpio
      const packageEntity = this.packagesRepository.create(cleanedData);
      console.log(`[PackagesService] Entidad creada:`, JSON.stringify(packageEntity));
      
      // Guardar la entidad
      const result = await this.packagesRepository.save(packageEntity);
      console.log(`[PackagesService] Paquete creado exitosamente:`, JSON.stringify(result));
      
      // Asegurarnos de que el resultado es una entidad Package y no un array
      const savedPackage = result as Package;
      
      return savedPackage;
    } catch (error) {
      console.error(`[PackagesService] Error al crear paquete:`, error);
      throw error;
    }
  }

  async findAll(): Promise<Package[]> {
    return this.packagesRepository.find({
      relations: ['telefonica'],
    });
  }

  async findActive(): Promise<Package[]> {
    return this.packagesRepository.find({
      where: { activo: true },
      relations: ['telefonica'],
    });
  }

  async findOne(id: number): Promise<Package> {
    const packageEntity = await this.packagesRepository.findOne({
      where: { id },
      relations: ['telefonica'],
    });
    if (!packageEntity) {
      throw new NotFoundException(`Paquete con ID ${id} no encontrado`);
    }
    return packageEntity;
  }

  async update(id: number, updatePackageDto: UpdatePackageDto): Promise<Package> {
    console.log(`[PackagesService] Iniciando actualización de paquete ID: ${id}`);
    console.log(`[PackagesService] Datos recibidos:`, JSON.stringify(updatePackageDto));
    
    try {
      // Buscar el paquete existente
      const existingPackage = await this.packagesRepository.findOne({ where: { id } });
      if (!existingPackage) {
        throw new NotFoundException(`Paquete con ID ${id} no encontrado`);
      }
      
      // Crear un objeto limpio con los datos convertidos explícitamente
      const cleanedData: any = {};
      
      // Funciones de utilidad para conversión segura de tipos
      const safeParseInt = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseInt(String(value).trim()) || 0;
      };
      
      const safeParseFloat = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseFloat(String(value).trim()) || 0;
      };
      
      // Procesar cada campo individualmente para asegurar el tipo correcto
      if (updatePackageDto.nombre !== undefined) {
        cleanedData.nombre = updatePackageDto.nombre.trim();
      }
      
      if (updatePackageDto.descripcion !== undefined) {
        cleanedData.descripcion = updatePackageDto.descripcion.trim();
      }
      
      if (updatePackageDto.telefonicaId !== undefined) {
        cleanedData.telefonicaId = safeParseInt(updatePackageDto.telefonicaId);
      }
      
      if (updatePackageDto.precio !== undefined) {
        cleanedData.precio = safeParseFloat(updatePackageDto.precio);
      }
      
      if (updatePackageDto.activo !== undefined) {
        cleanedData.activo = Boolean(updatePackageDto.activo);
      }
      
      console.log(`[PackagesService] Datos procesados:`, JSON.stringify(cleanedData));
      
      // Actualizar directamente usando queryBuilder para mayor control
      await this.packagesRepository.update(id, cleanedData);
      
      // Obtener el paquete actualizado
      const updatedPackage = await this.packagesRepository.findOne({ where: { id } });
      console.log(`[PackagesService] Paquete actualizado:`, JSON.stringify(updatedPackage));
      
      return updatedPackage;
    } catch (error) {
      console.error(`[PackagesService] Error al actualizar paquete:`, error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const packageEntity = await this.findOne(id);
    await this.packagesRepository.remove(packageEntity);
  }

  async findByPhoneLine(phoneLineId: number): Promise<Package[]> {
    return this.packagesRepository.find({
      where: { telefonicaId: phoneLineId, activo: true },
      relations: ['telefonica'],
    });
  }
}

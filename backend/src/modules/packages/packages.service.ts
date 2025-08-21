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
    const packageEntity = this.packagesRepository.create(createPackageDto);
    return this.packagesRepository.save(packageEntity);
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
    const packageEntity = await this.findOne(id);
    this.packagesRepository.merge(packageEntity, updatePackageDto);
    return this.packagesRepository.save(packageEntity);
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

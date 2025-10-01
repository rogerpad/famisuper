import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CierreSuper } from './entities/cierre-super.entity';
import { CreateCierreSuperDto } from './dto/create-cierre-super.dto';
import { UpdateCierreSuperDto } from './dto/update-cierre-super.dto';

@Injectable()
export class CierresSuperService {
  constructor(
    @InjectRepository(CierreSuper)
    private cierresSuperRepository: Repository<CierreSuper>,
  ) {}

  async create(createCierreSuperDto: CreateCierreSuperDto): Promise<CierreSuper> {
    const cierreSuper = this.cierresSuperRepository.create({
      ...createCierreSuperDto,
      fechaCierre: createCierreSuperDto.fechaCierre || new Date(),
    });
    return this.cierresSuperRepository.save(cierreSuper);
  }

  async findAll(): Promise<CierreSuper[]> {
    return this.cierresSuperRepository.find({
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CierreSuper> {
    const cierreSuper = await this.cierresSuperRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!cierreSuper) {
      throw new NotFoundException(`Cierre Super con ID ${id} no encontrado`);
    }
    
    return cierreSuper;
  }

  async update(id: number, updateCierreSuperDto: UpdateCierreSuperDto): Promise<CierreSuper> {
    const cierreSuper = await this.findOne(id);
    
    Object.assign(cierreSuper, updateCierreSuperDto);
    
    return this.cierresSuperRepository.save(cierreSuper);
  }

  async remove(id: number): Promise<void> {
    const cierreSuper = await this.findOne(id);
    await this.cierresSuperRepository.remove(cierreSuper);
  }

  async findByUsuario(usuarioId: number): Promise<CierreSuper[]> {
    return this.cierresSuperRepository.find({
      where: { usuarioId },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findByFecha(fechaInicio: Date, fechaFin: Date): Promise<CierreSuper[]> {
    return this.cierresSuperRepository.find({
      where: {
        fechaCierre: Between(fechaInicio, fechaFin),
      },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findActivos(): Promise<CierreSuper[]> {
    return this.cierresSuperRepository.find({
      where: { activo: true },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }
}

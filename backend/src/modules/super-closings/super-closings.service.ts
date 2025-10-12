import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SuperClosing } from './entities/super-closing.entity';
import { CreateSuperClosingDto, UpdateSuperClosingDto } from './dto';

@Injectable()
export class SuperClosingsService {
  constructor(
    @InjectRepository(SuperClosing)
    private superClosingsRepository: Repository<SuperClosing>,
  ) {}

  async create(createSuperClosingDto: CreateSuperClosingDto): Promise<SuperClosing> {
    const superClosing = this.superClosingsRepository.create({
      ...createSuperClosingDto,
      fechaCierre: createSuperClosingDto.fechaCierre || new Date(),
    });
    return this.superClosingsRepository.save(superClosing);
  }

  async findAll(): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SuperClosing> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`Invalid ID: ${id}`);
    }
    
    const superClosing = await this.superClosingsRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!superClosing) {
      throw new NotFoundException(`Super Closing with ID ${id} not found`);
    }
    
    return superClosing;
  }

  async update(id: number, updateSuperClosingDto: UpdateSuperClosingDto): Promise<SuperClosing> {
    const superClosing = await this.findOne(id);
    
    Object.assign(superClosing, updateSuperClosingDto);
    
    return this.superClosingsRepository.save(superClosing);
  }

  async remove(id: number): Promise<void> {
    const superClosing = await this.findOne(id);
    await this.superClosingsRepository.remove(superClosing);
  }

  async findByUsuario(usuarioId: number): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      where: { usuarioId },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findByFecha(fechaInicio: Date, fechaFin: Date): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      where: {
        fechaCierre: Between(fechaInicio, fechaFin),
      },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findActivos(): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      where: { activo: true },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async getUltimoCierreInactivoDelDia(): Promise<{ efectivoCierreTurno: number } | null> {
    try {
      console.log(`[SUPER_CLOSINGS_SERVICE] Starting search for last inactive closing of the day`);
      
      const ultimoCierre = await this.superClosingsRepository.findOne({
        where: {
          activo: false,
        },
        order: { fechaCierre: 'DESC' },
      });

      console.log(`[SUPER_CLOSINGS_SERVICE] Last inactive closing found:`, ultimoCierre);

      if (ultimoCierre) {
        const result = { efectivoCierreTurno: Number(ultimoCierre.efectivoCierreTurno) || 0 };
        console.log(`[SUPER_CLOSINGS_SERVICE] Returning:`, result);
        return result;
      }

      console.log(`[SUPER_CLOSINGS_SERVICE] No inactive closing found`);
      return null;
    } catch (error) {
      console.error(`[SUPER_CLOSINGS_SERVICE] Error getting last inactive closing:`, error);
      console.error(`[SUPER_CLOSINGS_SERVICE] Stack trace:`, error.stack);
      throw error;
    }
  }
}

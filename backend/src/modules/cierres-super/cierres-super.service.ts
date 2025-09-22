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
    if (!id || isNaN(id)) {
      throw new NotFoundException(`ID inválido: ${id}`);
    }
    
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

  async getUltimoCierreInactivoDelDia(): Promise<{ efectivoCierreTurno: number } | null> {
    try {
      console.log(`[CIERRES_SUPER_SERVICE] Iniciando búsqueda de último cierre inactivo del día`);
      
      // Simplificar la consulta para evitar problemas con fechas
      const ultimoCierre = await this.cierresSuperRepository.findOne({
        where: {
          activo: false,
        },
        order: { fechaCierre: 'DESC' },
      });

      console.log(`[CIERRES_SUPER_SERVICE] Último cierre inactivo encontrado:`, ultimoCierre);

      if (ultimoCierre) {
        const result = { efectivoCierreTurno: Number(ultimoCierre.efectivoCierreTurno) || 0 };
        console.log(`[CIERRES_SUPER_SERVICE] Retornando:`, result);
        return result;
      }

      console.log(`[CIERRES_SUPER_SERVICE] No se encontró ningún cierre inactivo`);
      return null;
    } catch (error) {
      console.error(`[CIERRES_SUPER_SERVICE] Error al obtener último cierre inactivo:`, error);
      console.error(`[CIERRES_SUPER_SERVICE] Stack trace:`, error.stack);
      throw error;
    }
  }
}

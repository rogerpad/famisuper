import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperBillCount } from './entities/super-bill-count.entity';
import { CreateSuperBillCountDto } from './dto/create-super-bill-count.dto';
import { UpdateSuperBillCountDto } from './dto/update-super-bill-count.dto';
import { SuperBillCountDto } from './dto/super-bill-count.dto';

@Injectable()
export class SuperBillCountService {
  constructor(
    @InjectRepository(SuperBillCount)
    private superBillCountRepository: Repository<SuperBillCount>,
  ) {}

  async create(createSuperBillCountDto: CreateSuperBillCountDto): Promise<SuperBillCountDto> {
    // Calculate totals per denomination
    const count = this.calculateTotals(createSuperBillCountDto);
    
    // Create a new entity instance with the data
    const newCount = this.superBillCountRepository.create();
    
    // Copy all calculated count properties to the new instance
    Object.assign(newCount, count);
    
    // Ensure the date is set correctly
    (newCount as SuperBillCount).fecha = new Date();
    
    // TypeORM returns the saved object
    const savedCount = await this.superBillCountRepository.save(newCount);
    
    // Get the ID of the saved count
    let savedId: number | null = null;
    
    if (typeof savedCount === 'object' && savedCount !== null) {
      if (!Array.isArray(savedCount) && 'id' in savedCount) {
        savedId = (savedCount as SuperBillCount).id;
      } else if (Array.isArray(savedCount) && savedCount.length > 0 && 'id' in savedCount[0]) {
        savedId = (savedCount[0] as SuperBillCount).id;
      }
    }
        
    if (savedId === null) {
      throw new NotFoundException('Could not obtain the ID of the saved count');
    }
    
    // Find the saved count with user relation
    const countWithUser = await this.superBillCountRepository.findOne({
      where: { id: savedId },
      relations: ['usuario'],
    });
    
    if (!countWithUser) {
      throw new NotFoundException(`Could not find the newly created count with ID ${savedId}`);
    }
    
    return this.mapToDto(countWithUser);
  }

  async findAll(activo?: boolean): Promise<SuperBillCountDto[]> {
    const whereCondition: any = {};
    if (activo !== undefined) {
      whereCondition.activo = activo;
    }

    const counts = await this.superBillCountRepository.find({
      where: whereCondition,
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    }) as SuperBillCount[];
    
    // Map each count individually
    return counts.map((count) => this.mapToDto(count));
  }

  async findLastActive(): Promise<SuperBillCountDto> {
    const count = await this.superBillCountRepository.findOne({
      where: { activo: true },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
    
    if (!count) {
      throw new NotFoundException('No active bill count found');
    }
    
    return this.mapToDto(count);
  }

  async findOne(id: number): Promise<SuperBillCountDto> {
    const count = await this.superBillCountRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!count) {
      throw new NotFoundException(`Bill count with ID ${id} not found`);
    }
    
    return this.mapToDto(count);
  }

  async update(id: number, updateSuperBillCountDto: UpdateSuperBillCountDto): Promise<SuperBillCountDto> {
    // Verify if count exists
    const count = await this.superBillCountRepository.findOne({ where: { id } });
    if (!count) {
      throw new NotFoundException(`Bill count with ID ${id} not found`);
    }
    
    // Calculate totals if quantities were updated
    const updatedCount = this.calculateTotals(updateSuperBillCountDto);
    
    // Update in database
    await this.superBillCountRepository.update(id, updatedCount);
    
    // Get the updated count
    const result = await this.superBillCountRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!result) {
      throw new NotFoundException(`Could not find the updated count with ID ${id}`);
    }
    
    return this.mapToDto(result);
  }

  async remove(id: number): Promise<void> {
    const result = await this.superBillCountRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Bill count with ID ${id} not found`);
    }
  }

  private calculateTotals(count: CreateSuperBillCountDto | UpdateSuperBillCountDto): any {
    // Calculate totals per denomination
    const total500 = (count.cant500 || 0) * 500;
    const total200 = (count.cant200 || 0) * 200;
    const total100 = (count.cant100 || 0) * 100;
    const total50 = (count.cant50 || 0) * 50;
    const total20 = (count.cant20 || 0) * 20;
    const total10 = (count.cant10 || 0) * 10;
    const total5 = (count.cant5 || 0) * 5;
    const total2 = (count.cant2 || 0) * 2;
    const total1 = (count.cant1 || 0) * 1;
    
    // Calculate grand total
    const totalGeneral = total500 + total200 + total100 + total50 + total20 + total10 + total5 + total2 + total1;
    
    return {
      ...count,
      total500,
      total200,
      total100,
      total50,
      total20,
      total10,
      total5,
      total2,
      total1,
      totalGeneral,
    };
  }

  private mapToDto(count: SuperBillCount): SuperBillCountDto {
    const dto: SuperBillCountDto = {
      id: count.id,
      usuarioId: count.usuarioId,
      deno500: count.deno500,
      cant500: count.cant500,
      total500: count.total500,
      deno200: count.deno200,
      cant200: count.cant200,
      total200: count.total200,
      deno100: count.deno100,
      cant100: count.cant100,
      total100: count.total100,
      deno50: count.deno50,
      cant50: count.cant50,
      total50: count.total50,
      deno20: count.deno20,
      cant20: count.cant20,
      total20: count.total20,
      deno10: count.deno10,
      cant10: count.cant10,
      total10: count.total10,
      deno5: count.deno5,
      cant5: count.cant5,
      total5: count.total5,
      deno2: count.deno2,
      cant2: count.cant2,
      total2: count.total2,
      deno1: count.deno1,
      cant1: count.cant1,
      total1: count.total1,
      totalGeneral: count.totalGeneral,
      activo: count.activo,
      fecha: count.fecha,
    };
    
    // Add user information if available
    if (count.usuario) {
      dto.usuario = {
        id: count.usuario.id,
        nombre: count.usuario.nombre,
        apellido: count.usuario.apellido || '',
      };
    }
    
    return dto;
  }
}

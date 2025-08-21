import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceFlow } from './entities/balance-flow.entity';
import { CreateBalanceFlowDto } from './dto/create-balance-flow.dto';
import { UpdateBalanceFlowDto } from './dto/update-balance-flow.dto';

@Injectable()
export class BalanceFlowsService {
  constructor(
    @InjectRepository(BalanceFlow)
    private balanceFlowsRepository: Repository<BalanceFlow>,
  ) {}

  async create(createBalanceFlowDto: CreateBalanceFlowDto): Promise<BalanceFlow> {
    // Asegurar que la fecha se procese correctamente
    if (createBalanceFlowDto.fecha) {
      console.log('Fecha original en create:', createBalanceFlowDto.fecha);
      createBalanceFlowDto.fecha = new Date(createBalanceFlowDto.fecha);
      console.log('Fecha convertida en create:', createBalanceFlowDto.fecha);
    }
    
    const balanceFlow = this.balanceFlowsRepository.create(createBalanceFlowDto);
    return this.balanceFlowsRepository.save(balanceFlow);
  }

  async findAll(): Promise<BalanceFlow[]> {
    return this.balanceFlowsRepository.find({
      relations: ['telefonica'],
      order: { fecha: 'DESC' },
    });
  }

  async findActive(): Promise<BalanceFlow[]> {
    return this.balanceFlowsRepository.find({
      where: { activo: true },
      relations: ['telefonica'],
      order: { fecha: 'DESC' },
    });
  }

  async findByPhoneLine(telefonicaId: number): Promise<BalanceFlow[]> {
    return this.balanceFlowsRepository.find({
      where: { telefonicaId },
      relations: ['telefonica'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BalanceFlow> {
    const balanceFlow = await this.balanceFlowsRepository.findOne({
      where: { id },
      relations: ['telefonica'],
    });
    
    if (!balanceFlow) {
      throw new NotFoundException(`Flujo de saldo con ID ${id} no encontrado`);
    }
    
    return balanceFlow;
  }

  async update(id: number, updateBalanceFlowDto: UpdateBalanceFlowDto): Promise<BalanceFlow> {
    const balanceFlow = await this.findOne(id);
    
    // Asegurar que la fecha se procese correctamente
    if (updateBalanceFlowDto.fecha) {
      console.log('Fecha original en update:', updateBalanceFlowDto.fecha);
      // Intentar convertir la fecha a un objeto Date válido
      try {
        updateBalanceFlowDto.fecha = new Date(updateBalanceFlowDto.fecha);
        console.log('Fecha convertida en update:', updateBalanceFlowDto.fecha);
      } catch (error) {
        console.error('Error al convertir fecha:', error);
        // Si hay error, mantener la fecha original del registro
        delete updateBalanceFlowDto.fecha;
      }
    }
    
    console.log('DTO final para actualizar:', JSON.stringify(updateBalanceFlowDto));
    this.balanceFlowsRepository.merge(balanceFlow, updateBalanceFlowDto);
    return this.balanceFlowsRepository.save(balanceFlow);
  }

  async remove(id: number): Promise<void> {
    const balanceFlow = await this.findOne(id);
    await this.balanceFlowsRepository.remove(balanceFlow);
  }
}

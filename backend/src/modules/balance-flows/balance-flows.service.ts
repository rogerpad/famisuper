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
    console.log('Datos recibidos para actualizar (raw):', JSON.stringify(updateBalanceFlowDto));
    
    // Buscar el flujo de saldo existente
    const balanceFlow = await this.findOne(id);
    
    // Crear un objeto limpio para la actualización
    const cleanDto: Partial<BalanceFlow> = {};
    
    // Procesar cada campo individualmente para asegurar la conversión de tipos
    if (updateBalanceFlowDto.nombre !== undefined) {
      cleanDto.nombre = String(updateBalanceFlowDto.nombre).trim();
    }
    
    // Procesar telefonicaId explícitamente para asegurar que se actualice
    if (updateBalanceFlowDto.telefonicaId !== undefined) {
      const telefonicaId = parseInt(String(updateBalanceFlowDto.telefonicaId).trim());
      console.log('Procesando telefonicaId:', telefonicaId);
      cleanDto.telefonicaId = telefonicaId || 0;
    }
    
    // Procesar campos numéricos
    if (updateBalanceFlowDto.saldoInicial !== undefined) {
      cleanDto.saldoInicial = parseFloat(String(updateBalanceFlowDto.saldoInicial).trim()) || 0;
    }
    
    if (updateBalanceFlowDto.saldoComprado !== undefined) {
      cleanDto.saldoComprado = parseFloat(String(updateBalanceFlowDto.saldoComprado).trim()) || 0;
    }
    
    if (updateBalanceFlowDto.saldoVendido !== undefined) {
      cleanDto.saldoVendido = parseFloat(String(updateBalanceFlowDto.saldoVendido).trim()) || 0;
    }
    
    if (updateBalanceFlowDto.saldoFinal !== undefined) {
      cleanDto.saldoFinal = parseFloat(String(updateBalanceFlowDto.saldoFinal).trim()) || 0;
    }
    
    // Procesar campo booleano
    if (updateBalanceFlowDto.activo !== undefined) {
      cleanDto.activo = Boolean(updateBalanceFlowDto.activo);
    }
    
    // Asegurar que la fecha se procese correctamente
    if (updateBalanceFlowDto.fecha) {
      console.log('Fecha original en update:', updateBalanceFlowDto.fecha);
      // Intentar convertir la fecha a un objeto Date válido
      try {
        cleanDto.fecha = new Date(updateBalanceFlowDto.fecha);
        console.log('Fecha convertida en update:', cleanDto.fecha);
      } catch (error) {
        console.error('Error al convertir fecha:', error);
        // Si hay error, no incluir la fecha en la actualización
      }
    }
    
    console.log('DTO limpio para actualizar:', JSON.stringify(cleanDto));
    
    // Usar queryBuilder para actualizar directamente en la base de datos
    // Esto evita problemas con campos que no se actualizan correctamente
    await this.balanceFlowsRepository
      .createQueryBuilder()
      .update(BalanceFlow)
      .set(cleanDto)
      .where("id = :id", { id })
      .execute();
    
    // Devolver el objeto actualizado
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const balanceFlow = await this.findOne(id);
    await this.balanceFlowsRepository.remove(balanceFlow);
  }
}

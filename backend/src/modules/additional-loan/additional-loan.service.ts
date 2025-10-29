import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdditionalLoan } from './entities/additional-loan.entity';
import { 
  CreateAdditionalLoanDto, 
  UpdateAdditionalLoanDto
} from './dto';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

@Injectable()
export class AdditionalLoanService {
  constructor(
    @InjectRepository(AdditionalLoan)
    private additionalLoanRepository: Repository<AdditionalLoan>,
    @InjectRepository(UsuarioTurno)
    private usuarioTurnoRepository: Repository<UsuarioTurno>,
  ) {}

  async create(createAdditionalLoanDto: CreateAdditionalLoanDto, userId?: number): Promise<AdditionalLoan> {
    // Obtener cajaNumero del turno activo si se proporciona userId
    let cajaNumero: number | null = null;
    if (userId || createAdditionalLoanDto.usuarioId) {
      const turnoActivo = await this.usuarioTurnoRepository.findOne({
        where: { usuarioId: userId || createAdditionalLoanDto.usuarioId, activo: true }
      });
      cajaNumero = turnoActivo?.cajaNumero || null;
      console.log('[AdditionalLoanService] Caja del turno activo:', cajaNumero);
    }
    
    const newAdditionalLoan = this.additionalLoanRepository.create({
      ...createAdditionalLoanDto,
      fecha: new Date(), // Asignar explícitamente la fecha actual
      cajaNumero  // Asignar caja del turno activo
    });
    return this.additionalLoanRepository.save(newAdditionalLoan);
  }

  async findAll(filters?: { acuerdo?: string; origen?: string; activo?: boolean }): Promise<AdditionalLoan[]> {
    // Construir el objeto de condiciones para el where
    const whereConditions: any = {};
    
    if (filters) {
      if (filters.acuerdo) {
        whereConditions.acuerdo = filters.acuerdo;
      }
      
      if (filters.origen) {
        whereConditions.origen = filters.origen;
      }
      
      if (filters.activo !== undefined) {
        whereConditions.activo = filters.activo;
      }
    }
    
    return this.additionalLoanRepository.find({
      where: whereConditions,
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<AdditionalLoan> {
    const additionalLoan = await this.additionalLoanRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!additionalLoan) {
      throw new NotFoundException(`Additional Loan with ID ${id} not found`);
    }
    
    return additionalLoan;
  }

  async update(id: number, updateAdditionalLoanDto: UpdateAdditionalLoanDto): Promise<AdditionalLoan> {
    const additionalLoan = await this.additionalLoanRepository.findOne({
      where: { id },
    });
    
    if (!additionalLoan) {
      throw new NotFoundException(`Additional Loan with ID ${id} not found`);
    }
    
    Object.assign(additionalLoan, updateAdditionalLoanDto);
    return this.additionalLoanRepository.save(additionalLoan);
  }

  async remove(id: number): Promise<void> {
    const result = await this.additionalLoanRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Additional Loan with ID ${id} not found`);
    }
  }
}

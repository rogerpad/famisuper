import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdditionalLoan } from './entities/additional-loan.entity';
import { 
  CreateAdditionalLoanDto, 
  UpdateAdditionalLoanDto, 
  AdditionalLoanDto 
} from './dto';

@Injectable()
export class AdditionalLoanService {
  constructor(
    @InjectRepository(AdditionalLoan)
    private additionalLoanRepository: Repository<AdditionalLoan>,
  ) {}

  async create(createAdditionalLoanDto: CreateAdditionalLoanDto): Promise<AdditionalLoanDto> {
    const newAdditionalLoan = this.additionalLoanRepository.create({
      ...createAdditionalLoanDto,
      fecha: new Date() // Asignar explícitamente la fecha actual
    });
    const savedAdditionalLoan = await this.additionalLoanRepository.save(newAdditionalLoan);
    
    // Para la creación, no necesitamos cargar la relación de usuario
    // Esto mejora el rendimiento
    return this.mapToDto(savedAdditionalLoan);
  }

  async findAll(filters?: { acuerdo?: string; origen?: string; activo?: boolean }): Promise<AdditionalLoanDto[]> {
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
    
    const additionalLoans = await this.additionalLoanRepository.find({
      where: whereConditions,
      relations: ['usuario'],
    });
    
    return additionalLoans.map(additionalLoan => this.mapToDto(additionalLoan));
  }

  async findOne(id: number): Promise<AdditionalLoanDto> {
    const additionalLoan = await this.additionalLoanRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!additionalLoan) {
      throw new NotFoundException(`Additional Loan with ID ${id} not found`);
    }
    
    return this.mapToDto(additionalLoan);
  }

  async update(id: number, updateAdditionalLoanDto: UpdateAdditionalLoanDto): Promise<AdditionalLoanDto> {
    const additionalLoan = await this.additionalLoanRepository.findOne({
      where: { id },
    });
    
    if (!additionalLoan) {
      throw new NotFoundException(`Additional Loan with ID ${id} not found`);
    }
    
    Object.assign(additionalLoan, updateAdditionalLoanDto);
    const updatedAdditionalLoan = await this.additionalLoanRepository.save(additionalLoan);
    return this.mapToDto(updatedAdditionalLoan);
  }

  async remove(id: number): Promise<void> {
    const result = await this.additionalLoanRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Additional Loan with ID ${id} not found`);
    }
  }

  private mapToDto(additionalLoan: AdditionalLoan): AdditionalLoanDto {
    const dto = new AdditionalLoanDto();
    dto.id = additionalLoan.id;
    dto.usuarioId = additionalLoan.usuarioId;
    dto.acuerdo = additionalLoan.acuerdo;
    dto.origen = additionalLoan.origen;
    dto.monto = additionalLoan.monto;
    dto.descripcion = additionalLoan.descripcion;
    dto.fecha = additionalLoan.fecha;
    dto.activo = additionalLoan.activo;
    
    if (additionalLoan.usuario) {
      dto.usuario = {
        id: additionalLoan.usuario.id,
        nombre: additionalLoan.usuario.nombre,
        apellido: additionalLoan.usuario.apellido,
        username: additionalLoan.usuario.username,
        email: additionalLoan.usuario.email,
        rol_id: additionalLoan.usuario.rol_id,
        activo: additionalLoan.usuario.activo
      };
    }
    
    return dto;
  }
}

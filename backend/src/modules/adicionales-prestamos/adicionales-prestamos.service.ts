import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdicionalesPrestamos } from './entities/adicionales-prestamos.entity';
import { 
  CreateAdicionalesPrestamosDto, 
  UpdateAdicionalesPrestamosDto, 
  AdicionalesPrestamosDto 
} from './dto';

@Injectable()
export class AdicionalesPrestamosService {
  constructor(
    @InjectRepository(AdicionalesPrestamos)
    private adicionalesPrestamosRepository: Repository<AdicionalesPrestamos>,
  ) {}

  async create(createAdicionalesPrestamosDto: CreateAdicionalesPrestamosDto): Promise<AdicionalesPrestamosDto> {
    const newAdicionalPrestamo = this.adicionalesPrestamosRepository.create({
      ...createAdicionalesPrestamosDto,
      fecha: new Date() // Asignar explícitamente la fecha actual
    });
    const savedAdicionalPrestamo = await this.adicionalesPrestamosRepository.save(newAdicionalPrestamo);
    
    // Para la creación, no necesitamos cargar la relación de usuario
    // Esto mejora el rendimiento
    return this.mapToDto(savedAdicionalPrestamo);
  }

  async findAll(filters?: { acuerdo?: string; origen?: string; activo?: boolean }): Promise<AdicionalesPrestamosDto[]> {
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
    
    const adicionalesPrestamos = await this.adicionalesPrestamosRepository.find({
      where: whereConditions,
      relations: ['usuario'],
    });
    
    return adicionalesPrestamos.map(adicionalPrestamo => this.mapToDto(adicionalPrestamo));
  }

  async findOne(id: number): Promise<AdicionalesPrestamosDto> {
    const adicionalPrestamo = await this.adicionalesPrestamosRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!adicionalPrestamo) {
      throw new NotFoundException(`Adicional/Préstamo con ID ${id} no encontrado`);
    }
    
    return this.mapToDto(adicionalPrestamo);
  }

  async update(id: number, updateAdicionalesPrestamosDto: UpdateAdicionalesPrestamosDto): Promise<AdicionalesPrestamosDto> {
    const adicionalPrestamo = await this.adicionalesPrestamosRepository.findOne({
      where: { id },
    });
    
    if (!adicionalPrestamo) {
      throw new NotFoundException(`Adicional/Préstamo con ID ${id} no encontrado`);
    }
    
    Object.assign(adicionalPrestamo, updateAdicionalesPrestamosDto);
    const updatedAdicionalPrestamo = await this.adicionalesPrestamosRepository.save(adicionalPrestamo);
    return this.mapToDto(updatedAdicionalPrestamo);
  }

  async remove(id: number): Promise<void> {
    const result = await this.adicionalesPrestamosRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Adicional/Préstamo con ID ${id} no encontrado`);
    }
  }

  private mapToDto(adicionalPrestamo: AdicionalesPrestamos): AdicionalesPrestamosDto {
    const dto = new AdicionalesPrestamosDto();
    dto.id = adicionalPrestamo.id;
    dto.usuarioId = adicionalPrestamo.usuarioId;
    dto.acuerdo = adicionalPrestamo.acuerdo;
    dto.origen = adicionalPrestamo.origen;
    dto.monto = adicionalPrestamo.monto;
    dto.descripcion = adicionalPrestamo.descripcion;
    dto.fecha = adicionalPrestamo.fecha;
    dto.activo = adicionalPrestamo.activo;
    
    if (adicionalPrestamo.usuario) {
      dto.usuario = {
        id: adicionalPrestamo.usuario.id,
        nombre: adicionalPrestamo.usuario.nombre,
        apellido: adicionalPrestamo.usuario.apellido,
        username: adicionalPrestamo.usuario.username,
        email: adicionalPrestamo.usuario.email,
        rol_id: adicionalPrestamo.usuario.rol_id,
        activo: adicionalPrestamo.usuario.activo
      };
    }
    
    return dto;
  }
}

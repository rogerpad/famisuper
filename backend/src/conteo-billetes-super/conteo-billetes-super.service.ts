import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConteoBilletesSuper } from '../database/entities/conteo-billetes-super.entity';
import { CreateConteoBilletesSuperDto } from './dto/create-conteo-billetes-super.dto';
import { UpdateConteoBilletesSuperDto } from './dto/update-conteo-billetes-super.dto';
import { ConteoBilletesSuperDto } from './dto/conteo-billetes-super.dto';

@Injectable()
export class ConteoBilletesSuperService {
  constructor(
    @InjectRepository(ConteoBilletesSuper)
    private conteoBilletesSuperRepository: Repository<ConteoBilletesSuper>,
  ) {}

  async create(createConteoBilletesSuperDto: CreateConteoBilletesSuperDto): Promise<ConteoBilletesSuperDto> {
    // Calcular los totales por denominación
    const conteo = this.calculateTotals(createConteoBilletesSuperDto);
    
    // Crear una nueva instancia de la entidad con los datos
    // Usamos el método create del repositorio pero con un objeto vacío
    const newConteo = this.conteoBilletesSuperRepository.create();
    
    // Copiar todas las propiedades del conteo calculado a la nueva instancia
    Object.assign(newConteo, conteo);
    
    // Asegurarnos de que la fecha se establezca correctamente
    // Usamos una aserción de tipo para indicar a TypeScript que newConteo es de tipo ConteoBilletesSuper
    (newConteo as ConteoBilletesSuper).fecha = new Date();
    
    // TypeORM devuelve el objeto guardado
    const savedConteo = await this.conteoBilletesSuperRepository.save(newConteo);
    
    // Obtener el ID del conteo guardado
    let savedId: number | null = null;
    
    if (typeof savedConteo === 'object' && savedConteo !== null) {
      if (!Array.isArray(savedConteo) && 'id' in savedConteo) {
        savedId = (savedConteo as ConteoBilletesSuper).id;
      } else if (Array.isArray(savedConteo) && savedConteo.length > 0 && 'id' in savedConteo[0]) {
        savedId = (savedConteo[0] as ConteoBilletesSuper).id;
      }
    }
        
    if (savedId === null) {
      throw new NotFoundException('No se pudo obtener el ID del conteo guardado');
    }
    
    // Buscar el conteo guardado con la relación de usuario
    const conteoConUsuario = await this.conteoBilletesSuperRepository.findOne({
      where: { id: savedId },
      relations: ['usuario'],
    });
    
    if (!conteoConUsuario) {
      throw new NotFoundException(`No se pudo encontrar el conteo recién creado con ID ${savedId}`);
    }
    
    return this.mapToDto(conteoConUsuario);
  }

  async findAll(): Promise<ConteoBilletesSuperDto[]> {
    const conteos = await this.conteoBilletesSuperRepository.find({
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    }) as ConteoBilletesSuper[];
    
    // Mapear cada conteo individualmente
    return conteos.map((conteo) => this.mapToDto(conteo));
  }

  async findOne(id: number): Promise<ConteoBilletesSuperDto> {
    const conteo = await this.conteoBilletesSuperRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!conteo) {
      throw new NotFoundException(`Conteo de billetes con ID ${id} no encontrado`);
    }
    
    return this.mapToDto(conteo);
  }

  async update(id: number, updateConteoBilletesSuperDto: UpdateConteoBilletesSuperDto): Promise<ConteoBilletesSuperDto> {
    // Verificar si existe el conteo
    const conteo = await this.conteoBilletesSuperRepository.findOne({ where: { id } });
    if (!conteo) {
      throw new NotFoundException(`Conteo de billetes con ID ${id} no encontrado`);
    }
    
    // Calcular los totales si se actualizaron las cantidades
    const conteoActualizado = this.calculateTotals(updateConteoBilletesSuperDto);
    
    // Actualizar en la base de datos
    await this.conteoBilletesSuperRepository.update(id, conteoActualizado);
    
    // Obtener el conteo actualizado
    const result = await this.conteoBilletesSuperRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!result) {
      throw new NotFoundException(`No se pudo encontrar el conteo actualizado con ID ${id}`);
    }
    
    return this.mapToDto(result);
  }

  async remove(id: number): Promise<void> {
    const result = await this.conteoBilletesSuperRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Conteo de billetes con ID ${id} no encontrado`);
    }
  }

  private calculateTotals(conteo: CreateConteoBilletesSuperDto | UpdateConteoBilletesSuperDto): any {
    // Calcular totales por denominación
    const total500 = (conteo.cant500 || 0) * 500;
    const total200 = (conteo.cant200 || 0) * 200;
    const total100 = (conteo.cant100 || 0) * 100;
    const total50 = (conteo.cant50 || 0) * 50;
    const total20 = (conteo.cant20 || 0) * 20;
    const total10 = (conteo.cant10 || 0) * 10;
    const total5 = (conteo.cant5 || 0) * 5;
    const total2 = (conteo.cant2 || 0) * 2;
    const total1 = (conteo.cant1 || 0) * 1;
    
    // Calcular total general
    const totalGeneral = total500 + total200 + total100 + total50 + total20 + total10 + total5 + total2 + total1;
    
    return {
      ...conteo,
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

  private mapToDto(conteo: ConteoBilletesSuper): ConteoBilletesSuperDto {
    const dto: ConteoBilletesSuperDto = {
      id: conteo.id,
      usuarioId: conteo.usuarioId,
      deno500: conteo.deno500,
      cant500: conteo.cant500,
      total500: conteo.total500,
      deno200: conteo.deno200,
      cant200: conteo.cant200,
      total200: conteo.total200,
      deno100: conteo.deno100,
      cant100: conteo.cant100,
      total100: conteo.total100,
      deno50: conteo.deno50,
      cant50: conteo.cant50,
      total50: conteo.total50,
      deno20: conteo.deno20,
      cant20: conteo.cant20,
      total20: conteo.total20,
      deno10: conteo.deno10,
      cant10: conteo.cant10,
      total10: conteo.total10,
      deno5: conteo.deno5,
      cant5: conteo.cant5,
      total5: conteo.total5,
      deno2: conteo.deno2,
      cant2: conteo.cant2,
      total2: conteo.total2,
      deno1: conteo.deno1,
      cant1: conteo.cant1,
      total1: conteo.total1,
      totalGeneral: conteo.totalGeneral,
      activo: conteo.activo,
      fecha: conteo.fecha,
    };
    
    // Agregar información del usuario si está disponible
    if (conteo.usuario) {
      dto.usuario = {
        id: conteo.usuario.id,
        nombre: conteo.usuario.nombre,
        apellido: conteo.usuario.apellido || '',
      };
    }
    
    return dto;
  }
}

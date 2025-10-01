import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permiso } from '../entities/permiso.entity';
import { PermisoRol } from '../entities/permiso-rol.entity';
import { CreatePermisoDto } from '../dto/create-permiso.dto';
import { AssignPermisosDto } from '../dto/assign-permisos.dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private permisoRepository: Repository<Permiso>,
    @InjectRepository(PermisoRol)
    private permisoRolRepository: Repository<PermisoRol>,
  ) {}

  // Obtener todos los permisos
  async findAll(): Promise<Permiso[]> {
    return this.permisoRepository.find();
  }

  // Obtener permisos agrupados por módulo
  async findByModulos(): Promise<{ [key: string]: Permiso[] }> {
    const permisos = await this.permisoRepository.find();
    
    // Agrupar por módulo
    return permisos.reduce((result, permiso) => {
      if (!result[permiso.modulo]) {
        result[permiso.modulo] = [];
      }
      result[permiso.modulo].push(permiso);
      return result;
    }, {});
  }

  // Obtener permisos por módulo específico
  async findByModulo(modulo: string): Promise<Permiso[]> {
    return this.permisoRepository.find({ where: { modulo } });
  }

  // Obtener permisos asignados a un rol
  async findByRol(rolId: number): Promise<Permiso[]> {
    const permisosRoles = await this.permisoRolRepository.find({
      where: { rol_id: rolId },
      relations: ['permiso'],
    });

    return permisosRoles.map(pr => pr.permiso);
  }

  // Crear un nuevo permiso
  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermiso = await this.permisoRepository.findOne({
      where: { nombre: createPermisoDto.nombre },
    });

    if (existingPermiso) {
      throw new ConflictException(`Ya existe un permiso con el nombre ${createPermisoDto.nombre}`);
    }

    const permiso = this.permisoRepository.create(createPermisoDto);
    return this.permisoRepository.save(permiso);
  }

  // Asignar permisos a un rol
  async assignToRol(assignPermisosDto: AssignPermisosDto): Promise<void> {
    const { rolId, permisosIds } = assignPermisosDto;

    // Eliminar asignaciones anteriores
    await this.permisoRolRepository.delete({ rol_id: rolId });

    // Crear nuevas asignaciones
    const permisosRoles = permisosIds.map(permisoId => {
      return this.permisoRolRepository.create({
        rol_id: rolId,
        permiso_id: permisoId,
      });
    });

    await this.permisoRolRepository.save(permisosRoles);
  }

  // Verificar si existen todos los permisos en la lista y devolver solo los válidos
  async validatePermisosExist(permisosIds: number[]): Promise<number[]> {
    // Si no hay IDs, devolver array vacío
    if (!permisosIds || permisosIds.length === 0) {
      return [];
    }
    
    console.log('Validando permisos IDs:', permisosIds);
    
    const permisos = await this.permisoRepository.find({
      where: { id: In(permisosIds) },
    });
    
    const validIds = permisos.map(p => p.id);
    console.log('IDs válidos encontrados:', validIds);
    
    if (validIds.length !== permisosIds.length) {
      const missingIds = permisosIds.filter(id => !validIds.includes(id));
      console.log('IDs no encontrados:', missingIds);
    }
    
    return validIds;
  }

  // Actualizar un permiso existente
  async update(id: number, updatePermisoDto: any): Promise<Permiso> {
    console.log(`[PERMISOS-SERVICE] Actualizando permiso con ID: ${id}`, updatePermisoDto);
    
    // Verificar si el permiso existe
    const permiso = await this.permisoRepository.findOne({
      where: { id }
    });

    if (!permiso) {
      throw new NotFoundException(`No se encontró el permiso con ID ${id}`);
    }

    // Si se está actualizando el nombre, verificar que no exista otro permiso con ese nombre
    if (updatePermisoDto.nombre && updatePermisoDto.nombre !== permiso.nombre) {
      const existingPermiso = await this.permisoRepository.findOne({
        where: { nombre: updatePermisoDto.nombre }
      });

      if (existingPermiso && existingPermiso.id !== id) {
        throw new ConflictException(`Ya existe un permiso con el nombre ${updatePermisoDto.nombre}`);
      }
    }

    // Actualizar el permiso
    await this.permisoRepository.update(id, updatePermisoDto);
    
    // Devolver el permiso actualizado
    return this.permisoRepository.findOne({
      where: { id }
    });
  }

  // Eliminar un permiso
  async remove(id: number): Promise<void> {
    console.log(`[PERMISOS-SERVICE] Eliminando permiso con ID: ${id}`);
    
    // Verificar si el permiso existe
    const permiso = await this.permisoRepository.findOne({
      where: { id }
    });

    if (!permiso) {
      throw new NotFoundException(`No se encontró el permiso con ID ${id}`);
    }

    // Verificar si el permiso está asignado a algún rol
    const permisosRoles = await this.permisoRolRepository.find({
      where: { permiso_id: id }
    });

    if (permisosRoles.length > 0) {
      // Eliminar las asignaciones de roles primero
      await this.permisoRolRepository.delete({ permiso_id: id });
    }

    // Eliminar el permiso
    await this.permisoRepository.delete(id);
  }
}

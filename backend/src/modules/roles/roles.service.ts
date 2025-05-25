import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  /**
   * Crea un nuevo rol
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar si ya existe un rol con el mismo nombre
    const existingRole = await this.rolesRepository.findOne({
      where: { nombre: createRoleDto.nombre },
    });

    if (existingRole) {
      throw new ConflictException(`Ya existe un rol con el nombre ${createRoleDto.nombre}`);
    }

    const newRole = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(newRole);
  }

  /**
   * Obtiene todos los roles
   */
  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  /**
   * Obtiene un rol por su ID
   */
  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  /**
   * Actualiza un rol existente
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    // Verificar si el rol existe
    const role = await this.findOne(id);

    // Verificar si ya existe otro rol con el mismo nombre (si se está actualizando el nombre)
    if (updateRoleDto.nombre && updateRoleDto.nombre !== role.nombre) {
      const existingRole = await this.rolesRepository.findOne({
        where: { nombre: updateRoleDto.nombre },
      });

      if (existingRole) {
        throw new ConflictException(`Ya existe un rol con el nombre ${updateRoleDto.nombre}`);
      }
    }

    // Actualizar el rol
    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  /**
   * Elimina un rol
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }

  /**
   * Cambia el estado de un rol (activo/inactivo)
   */
  async toggleStatus(id: number): Promise<Role> {
    const role = await this.findOne(id);
    role.activo = !role.activo;
    return this.rolesRepository.save(role);
  }

  /**
   * Obtiene los roles activos
   */
  async findActive(): Promise<Role[]> {
    return this.rolesRepository.find({
      where: { activo: true },
      order: {
        nombre: 'ASC',
      },
    });
  }
}

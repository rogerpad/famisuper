import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from '../entities/permiso.entity';
import { PermisoRol } from '../entities/permiso-rol.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserPermissionsService {
  constructor(
    @InjectRepository(PermisoRol)
    private permisoRolRepository: Repository<PermisoRol>,
    @InjectRepository(Permiso)
    private permisoRepository: Repository<Permiso>,
  ) {}

  /**
   * Obtiene todos los permisos asignados a un usuario según su rol
   * @param userId ID del usuario
   * @returns Array de permisos
   */
  async getUserPermissions(userId: number): Promise<Permiso[]> {
    // Obtener los permisos del rol del usuario
    const permisos = await this.permisoRepository
      .createQueryBuilder('p')
      .innerJoin('p.permisosRoles', 'pr')
      .innerJoin('pr.rol', 'r')
      .innerJoin('tbl_usuarios', 'u', 'u.rol_id = r.id')
      .where('u.id = :userId', { userId })
      .getMany();

    return permisos;
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * @param userId ID del usuario
   * @param permisoCode Código del permiso a verificar
   * @returns boolean
   */
  async hasPermission(userId: number, permisoCode: string): Promise<boolean> {
    const count = await this.permisoRepository
      .createQueryBuilder('p')
      .innerJoin('p.permisosRoles', 'pr')
      .innerJoin('pr.rol', 'r')
      .innerJoin('tbl_usuarios', 'u', 'u.rol_id = r.id')
      .where('u.id = :userId', { userId })
      .andWhere('p.codigo = :permisoCode', { permisoCode })
      .getCount();

    return count > 0;
  }

  /**
   * Verifica si un usuario tiene todos los permisos especificados
   * @param userId ID del usuario
   * @param permisoCodes Array de códigos de permisos a verificar
   * @returns boolean
   */
  async hasPermissions(userId: number, permisoCodes: string[]): Promise<boolean> {
    const permisos = await this.permisoRepository
      .createQueryBuilder('p')
      .innerJoin('p.permisosRoles', 'pr')
      .innerJoin('pr.rol', 'r')
      .innerJoin('tbl_usuarios', 'u', 'u.rol_id = r.id')
      .where('u.id = :userId', { userId })
      .andWhere('p.codigo IN (:...permisoCodes)', { permisoCodes })
      .getMany();

    return permisos.length === permisoCodes.length;
  }

  /**
   * Obtiene un mapa de permisos para un usuario
   * @param userId ID del usuario
   * @returns Objeto con los códigos de permisos como claves y true como valores
   */
  async getUserPermissionsMap(userId: number): Promise<Record<string, boolean>> {
    try {
      const permisos = await this.getUserPermissions(userId);
      const permissionsMap: Record<string, boolean> = {};
      
      console.log(`Permisos obtenidos para el usuario ${userId}:`, permisos);
      
      permisos.forEach(permiso => {
        if (permiso.codigo) {
          permissionsMap[permiso.codigo] = true;
        } else {
          console.warn(`Permiso sin código encontrado: ${permiso.id} - ${permiso.nombre}`);
        }
      });
      
      console.log(`Mapa de permisos generado para el usuario ${userId}:`, permissionsMap);
      return permissionsMap;
    } catch (error) {
      console.error(`Error al obtener mapa de permisos para el usuario ${userId}:`, error);
      // Devolver un objeto vacío en caso de error para evitar que la aplicación se rompa
      return {};
    }
  }
}

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PermisoRol } from '../../permisos/entities/permiso-rol.entity';

@Entity({ name: 'tbl_roles' })
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
  
  @OneToMany(() => PermisoRol, permisoRol => permisoRol.rol)
  permisosRoles: PermisoRol[];
}

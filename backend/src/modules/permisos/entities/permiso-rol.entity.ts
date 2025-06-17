import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Permiso } from './permiso.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('tbl_permisos_roles')
export class PermisoRol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rol_id' })
  rol_id: number;

  @Column({ name: 'permiso_id' })
  permiso_id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Role, role => role.permisosRoles)
  @JoinColumn({ name: 'rol_id' })
  rol: Role;

  @ManyToOne(() => Permiso, permiso => permiso.permisosRoles)
  @JoinColumn({ name: 'permiso_id' })
  permiso: Permiso;
}

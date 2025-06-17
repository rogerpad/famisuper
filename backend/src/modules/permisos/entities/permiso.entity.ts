import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PermisoRol } from './permiso-rol.entity';

@Entity('tbl_permisos')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ length: 50 })
  modulo: string;
  
  @Column({ length: 50, unique: true })
  codigo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PermisoRol, permisoRol => permisoRol.permiso)
  permisosRoles: PermisoRol[];
}

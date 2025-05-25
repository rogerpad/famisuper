import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity({ name: 'tbl_usuarios' })
export class User {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 128 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido: string;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  email: string;

  @Column({ type: 'bigint' })
  rol_id: number;

  // Estas columnas podrían no existir en la base de datos según el error
  // Comentamos temporalmente para verificar si este es el problema
  // @Column({ name: 'fecha_registro', type: 'timestamp with time zone' })
  // fecha_registro: Date;

  // @Column({ name: 'ultimo_acceso', type: 'timestamp with time zone', nullable: true })
  // ultimo_acceso: Date;

  @Column({ type: 'boolean' })
  activo: boolean;
  
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'rol_id' })
  rol: Role;
}

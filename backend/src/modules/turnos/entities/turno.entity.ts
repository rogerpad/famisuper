import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tbl_turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'hora_inicio', length: 5, nullable: true })
  horaInicio: string;

  @Column({ name: 'hora_fin', length: 5, nullable: true })
  horaFin: string;

  @Column({ nullable: true, length: 255 })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  // La columna usuario_id ha sido eliminada de la tabla
  // La relación ahora se maneja completamente a través de tbl_usuarios_turnos

  @ManyToMany(() => User)
  @JoinTable({
    name: 'tbl_usuarios_turnos',
    joinColumn: { name: 'turno_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usuario_id', referencedColumnName: 'id' }
  })
  usuarios: User[];

  @Column({ name: 'creado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column({ name: 'actualizado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;
}

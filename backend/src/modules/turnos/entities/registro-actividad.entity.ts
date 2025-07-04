import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Turno } from './turno.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tbl_registros_actividad_turnos')
export class RegistroActividad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ length: 50 })
  accion: string; // 'iniciar', 'finalizar', etc.

  @CreateDateColumn({ name: 'fecha_hora' })
  fechaHora: Date;

  @Column({ nullable: true, length: 255 })
  descripcion: string;
}

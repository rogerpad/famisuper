import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Turno } from './turno.entity';

@Entity('tbl_usuarios_turnos')
export class UsuarioTurno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'turno_id' })
  turnoId: number;

  @CreateDateColumn({ name: 'fecha_asignacion', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fechaAsignacion: Date;

  @Column({ name: 'hora_inicio_real', length: 5, nullable: true })
  horaInicioReal: string;

  @Column({ name: 'hora_fin_real', length: 5, nullable: true })
  horaFinReal: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: false })
  agente: boolean;

  @Column({ default: false })
  super: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Turno)
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;
}

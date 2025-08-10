import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { AgentClosing } from './agent-closing.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tbl_ajustes_cierre')
export class ClosingAdjustment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cierre_id' })
  closingId: number;

  @ManyToOne(() => AgentClosing, closing => closing.adjustments)
  @JoinColumn({ name: 'cierre_id' })
  closing: AgentClosing;

  @Column({ name: 'usuario_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column({ name: 'monto_ajuste', type: 'decimal', precision: 10, scale: 2 })
  adjustmentAmount: number;

  @Column({ name: 'resultado_final_anterior', type: 'decimal', precision: 10, scale: 2 })
  previousFinalResult: number;

  @Column({ name: 'resultado_final_nuevo', type: 'decimal', precision: 10, scale: 2 })
  newFinalResult: number;
  
  @Column({ name: 'diferencia_anterior', type: 'decimal', precision: 10, scale: 2 })
  previousDifference: number;

  @Column({ name: 'diferencia_nueva', type: 'decimal', precision: 10, scale: 2 })
  newDifference: number;

  @Column({ name: 'justificacion', type: 'text' })
  justification: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  createdAt: Date;
}

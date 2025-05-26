import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { TransactionType } from '../../transaction-types/entities/transaction-type.entity';

@Entity({ name: 'tbl_transacciones_agentes' })
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time' })
  hora: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'agente_id' })
  agente: Provider;

  @Column({ name: 'agente_id' })
  agenteId: number;

  @ManyToOne(() => TransactionType)
  @JoinColumn({ name: 'tipo_transaccion_id' })
  tipoTransaccion: TransactionType;

  @Column({ name: 'tipo_transaccion_id' })
  tipoTransaccionId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'text', nullable: true })
  observacion: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'fecha_registro' })
  fechaRegistro: Date;
}

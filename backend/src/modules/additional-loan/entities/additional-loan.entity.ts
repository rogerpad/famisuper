import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'tbl_adic_prest' })
export class AdditionalLoan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column()
  acuerdo: string;

  @Column()
  origen: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column()
  descripcion: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @Column({ default: true })
  activo: boolean;
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SuperClosing } from '../../super-closings/entities/super-closing.entity';

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

  @Column({ name: 'caja_numero', nullable: true })
  cajaNumero: number;

  @Column({ name: 'cierre_id', nullable: true })
  cierreId: number;

  @ManyToOne(() => SuperClosing, { nullable: true })
  @JoinColumn({ name: 'cierre_id' })
  cierre: SuperClosing;
}

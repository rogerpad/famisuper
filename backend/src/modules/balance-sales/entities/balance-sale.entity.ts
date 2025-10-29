import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PhoneLine } from '../../phone-lines/entities/phone-line.entity';
import { BalanceFlow } from '../../balance-flows/entities/balance-flow.entity';
import { SuperClosing } from '../../super-closings/entities/super-closing.entity';

@Entity({ name: 'tbl_ventas_saldo' })
export class BalanceSale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'telefonica_id' })
  telefonicaId: number;

  @ManyToOne(() => PhoneLine)
  @JoinColumn({ name: 'telefonica_id' })
  telefonica: PhoneLine;

  @Column({ name: 'flujo_saldo_id' })
  flujoSaldoId: number;

  @ManyToOne(() => BalanceFlow)
  @JoinColumn({ name: 'flujo_saldo_id' })
  flujoSaldo: BalanceFlow;

  @Column({ name: 'paquete_id', nullable: true })
  paqueteId: number;

  @Column()
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ nullable: true })
  observacion: string;

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

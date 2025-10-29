import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PhoneLine } from '../../phone-lines/entities/phone-line.entity';
import { SuperClosing } from '../../super-closings/entities/super-closing.entity';

@Entity({ name: 'tbl_flujos_saldo' })
export class BalanceFlow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'telefonica_id' })
  telefonicaId: number;

  @ManyToOne(() => PhoneLine)
  @JoinColumn({ name: 'telefonica_id' })
  telefonica: PhoneLine;

  @Column()
  nombre: string;

  @Column({ name: 'saldo_inicial', type: 'decimal', precision: 10, scale: 2 })
  saldoInicial: number;

  @Column({ name: 'saldo_comprado', type: 'decimal', precision: 10, scale: 2 })
  saldoComprado: number;

  @Column({ name: 'saldo_vendido', type: 'decimal', precision: 10, scale: 2 })
  saldoVendido: number;

  @Column({ name: 'saldo_final', type: 'decimal', precision: 10, scale: 2 })
  saldoFinal: number;

  @Column({ type: 'timestamp' })
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

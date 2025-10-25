import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SuperExpenseType } from '../../super-expense-types/entities/super-expense-type.entity';
import { PaymentDocument } from '../../payment-documents/entities/payment-document.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';

@Entity('tbl_egresos_super')
export class SuperExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'tipo_egreso_id' })
  tipoEgresoId: number;

  @ManyToOne(() => SuperExpenseType)
  @JoinColumn({ name: 'tipo_egreso_id' })
  tipoEgreso: SuperExpenseType;

  @Column({ name: 'descripcion_egreso', nullable: true })
  descripcionEgreso: string;

  @Column({ name: 'documento_pago_id', nullable: true })
  documentoPagoId: number;

  @ManyToOne(() => PaymentDocument, { nullable: true })
  @JoinColumn({ name: 'documento_pago_id' })
  documentoPago: PaymentDocument;

  @Column({ name: 'nro_factura', nullable: true })
  nroFactura: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  excento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gravado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuesto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'forma_pago_id' })
  formaPagoId: number;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'forma_pago_id' })
  formaPago: PaymentMethod;

  @Column({ name: 'fecha_egreso', type: 'date' })
  fechaEgreso: Date;
  
  @Column({ name: 'hora', type: 'time' })
  hora: string;

  @Column({ default: true })
  activo: boolean;
}

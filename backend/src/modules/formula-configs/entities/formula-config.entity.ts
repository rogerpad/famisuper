import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { TransactionType } from '../../transaction-types/entities/transaction-type.entity';

@Entity({ name: 'tbl_configuracion_formulas' })
export class FormulaConfig {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'proveedor_id' })
  proveedorId: number;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Provider;

  @Column({ name: 'tipo_transaccion_id' })
  tipoTransaccionId: number;

  @ManyToOne(() => TransactionType)
  @JoinColumn({ name: 'tipo_transaccion_id' })
  tipoTransaccion: TransactionType;

  @Column({ name: 'incluir_en_calculo', default: false })
  incluirEnCalculo: boolean;

  @Column({ name: 'factor_multiplicador', default: 1 })
  factorMultiplicador: number;
}

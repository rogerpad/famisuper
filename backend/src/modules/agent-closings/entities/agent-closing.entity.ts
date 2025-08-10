import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { ClosingAdjustment } from './closing-adjustment.entity';

@Entity({ name: 'tbl_cierre_final_agentes' })
export class AgentClosing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proveedor_id' })
  proveedorId: number;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Provider;

  @Column({ name: 'turno_id', nullable: true })
  turnoId: number;

  @Column({ name: 'fecha_cierre', type: 'date' })
  fechaCierre: Date;

  @Column({ name: 'saldo_inicial', type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoInicial: number;

  @Column({ name: 'adicional_cta', type: 'decimal', precision: 10, scale: 2, default: 0 })
  adicionalCta: number;

  @Column({ name: 'resultado_final', type: 'decimal', precision: 10, scale: 2, default: 0 })
  resultadoFinal: number;

  @Column({ name: 'saldo_final', type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoFinal: number;

  @Column({ name: 'diferencia', type: 'decimal', precision: 10, scale: 2, default: 0 })
  diferencia: number;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'estado', default: 'activo' })
  estado: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @OneToMany(() => ClosingAdjustment, adjustment => adjustment.closing)
  adjustments: ClosingAdjustment[];
}

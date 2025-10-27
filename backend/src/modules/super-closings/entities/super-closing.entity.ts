import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UsuarioTurno } from '../../turnos/entities/usuario-turno.entity';

@Entity('tbl_cierres_super')
export class SuperClosing {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'efectivo_inicial', type: 'decimal', precision: 10, scale: 2 })
  efectivoInicial: number;

  @Column({ name: 'adicional_casa', type: 'decimal', precision: 10, scale: 2 })
  adicionalCasa: number;

  @Column({ name: 'adicional_agente', type: 'decimal', precision: 10, scale: 2 })
  adicionalAgente: number;

  @Column({ name: 'venta_contado', type: 'decimal', precision: 10, scale: 2 })
  ventaContado: number;

  @Column({ name: 'venta_credito', type: 'decimal', precision: 10, scale: 2 })
  ventaCredito: number;

  @Column({ name: 'venta_pos', type: 'decimal', precision: 10, scale: 2 })
  ventaPos: number;

  @Column({ name: 'transf_occidente', type: 'decimal', precision: 10, scale: 2 })
  transfOccidente: number;

  @Column({ name: 'transf_atlantida', type: 'decimal', precision: 10, scale: 2 })
  transfAtlantida: number;

  @Column({ name: 'transf_bac', type: 'decimal', precision: 10, scale: 2 })
  transfBac: number;

  @Column({ name: 'transf_banpais', type: 'decimal', precision: 10, scale: 2 })
  transfBanpais: number;

  @Column({ name: 'total_spv', type: 'decimal', precision: 10, scale: 2 })
  totalSpv: number;

  @Column({ name: 'abono_credito', type: 'decimal', precision: 10, scale: 2 })
  abonoCredito: number;

  @Column({ name: 'venta_saldo', type: 'decimal', precision: 10, scale: 2 })
  ventaSaldo: number;

  @Column({ name: 'pago_productos', type: 'decimal', precision: 10, scale: 2 })
  pagoProductos: number;

  @Column({ name: 'gastos', type: 'decimal', precision: 10, scale: 2 })
  gastos: number;

  @Column({ name: 'presta_agentes', type: 'decimal', precision: 10, scale: 2 })
  prestaAgentes: number;

  @Column({ name: 'efectivo_total', type: 'decimal', precision: 10, scale: 2 })
  efectivoTotal: number;

  @Column({ name: 'efectivo_caja_f', type: 'decimal', precision: 10, scale: 2 })
  efectivoCajaF: number;

  @Column({ name: 'efectivo_cierre_turno', type: 'decimal', precision: 10, scale: 2 })
  efectivoCierreTurno: number;

  @Column({ name: 'faltante_sobrante', type: 'decimal', precision: 10, scale: 2 })
  faltanteSobrante: number;

  @Column({ name: 'fecha_cierre', type: 'timestamp' })
  fechaCierre: Date;

  @Column({ name: 'activo', default: true })
  activo: boolean;

  @Column({ name: 'caja_numero', type: 'integer', nullable: true })
  cajaNumero: number;

  @Column({ name: 'usuario_turno_id', type: 'integer', nullable: true })
  usuarioTurnoId: number;

  @ManyToOne(() => UsuarioTurno, { nullable: true })
  @JoinColumn({ name: 'usuario_turno_id' })
  usuarioTurno: UsuarioTurno;
}

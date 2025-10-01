import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Turno } from '../../turnos/entities/turno.entity';

@Entity('tbl_conteo_billetes')
export class Billete {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  // La columna turno_id no existe en la base de datos actual
  // Se debe agregar mediante migración
  turnoId?: number;

  // Relación con Turno (comentada hasta que exista la columna)
  // @ManyToOne(() => Turno, { nullable: true })
  // @JoinColumn({ name: 'turno_id' })
  turno?: Turno;

  // Denominación de 500
  @Column({ name: 'deno_500', type: 'numeric', nullable: true })
  deno500: number;

  @Column({ name: 'cant_500', type: 'numeric', nullable: true })
  cant500: number;

  @Column({ name: 'total_500', type: 'numeric', nullable: true })
  total500: number;

  // Denominación de 200
  @Column({ name: 'deno_200', type: 'numeric', nullable: true })
  deno200: number;

  @Column({ name: 'cant_200', type: 'numeric', nullable: true })
  cant200: number;

  @Column({ name: 'total_200', type: 'numeric', nullable: true })
  total200: number;

  // Denominación de 100
  @Column({ name: 'deno_100', type: 'numeric', nullable: true })
  deno100: number;

  @Column({ name: 'cant_100', type: 'numeric', nullable: true })
  cant100: number;

  @Column({ name: 'total_100', type: 'numeric', nullable: true })
  total100: number;

  // Denominación de 50
  @Column({ name: 'deno_50', type: 'numeric', nullable: true })
  deno50: number;

  @Column({ name: 'cant_50', type: 'numeric', nullable: true })
  cant50: number;

  @Column({ name: 'total_50', type: 'numeric', nullable: true })
  total50: number;

  // Denominación de 20
  @Column({ name: 'deno_20', type: 'numeric', nullable: true })
  deno20: number;

  @Column({ name: 'cant_20', type: 'numeric', nullable: true })
  cant20: number;

  @Column({ name: 'total_20', type: 'numeric', nullable: true })
  total20: number;

  // Denominación de 10
  @Column({ name: 'deno_10', type: 'numeric', nullable: true })
  deno10: number;

  @Column({ name: 'cant_10', type: 'numeric', nullable: true })
  cant10: number;

  @Column({ name: 'total_10', type: 'numeric', nullable: true })
  total10: number;

  // Denominación de 5
  @Column({ name: 'deno_5', type: 'numeric', nullable: true })
  deno5: number;

  @Column({ name: 'cant_5', type: 'numeric', nullable: true })
  cant5: number;

  @Column({ name: 'total_5', type: 'numeric', nullable: true })
  total5: number;

  // Denominación de 2
  @Column({ name: 'deno_2', type: 'numeric', nullable: true })
  deno2: number;

  @Column({ name: 'cant_2', type: 'numeric', nullable: true })
  cant2: number;

  @Column({ name: 'total_2', type: 'numeric', nullable: true })
  total2: number;

  // Denominación de 1
  @Column({ name: 'deno_1', type: 'numeric', nullable: true })
  deno1: number;

  @Column({ name: 'cant_1', type: 'numeric', nullable: true })
  cant1: number;

  @Column({ name: 'total_1', type: 'numeric', nullable: true })
  total1: number;

  @Column({ name: 'total_general', type: 'numeric' })
  totalGeneral: number;

  @Column({ name: 'estado', type: 'boolean', default: true })
  estado: boolean;

  @Column({ name: 'fecha', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
  
  // Estas columnas no existen en la base de datos actual
  // Se deben agregar mediante migración
  activo?: boolean;
  fechaRegistro?: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'tbl_conteo_billetes_super' })
export class ConteoBilletesSuper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'deno_500', default: 500 })
  deno500: number;

  @Column({ name: 'cant_500', default: 0 })
  cant500: number;

  @Column({ name: 'total_500', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total500: number;

  @Column({ name: 'deno_200', default: 200 })
  deno200: number;

  @Column({ name: 'cant_200', default: 0 })
  cant200: number;

  @Column({ name: 'total_200', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total200: number;

  @Column({ name: 'deno_100', default: 100 })
  deno100: number;

  @Column({ name: 'cant_100', default: 0 })
  cant100: number;

  @Column({ name: 'total_100', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total100: number;

  @Column({ name: 'deno_50', default: 50 })
  deno50: number;

  @Column({ name: 'cant_50', default: 0 })
  cant50: number;

  @Column({ name: 'total_50', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total50: number;

  @Column({ name: 'deno_20', default: 20 })
  deno20: number;

  @Column({ name: 'cant_20', default: 0 })
  cant20: number;

  @Column({ name: 'total_20', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total20: number;

  @Column({ name: 'deno_10', default: 10 })
  deno10: number;

  @Column({ name: 'cant_10', default: 0 })
  cant10: number;

  @Column({ name: 'total_10', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total10: number;

  @Column({ name: 'deno_5', default: 5 })
  deno5: number;

  @Column({ name: 'cant_5', default: 0 })
  cant5: number;

  @Column({ name: 'total_5', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total5: number;

  @Column({ name: 'deno_2', default: 2 })
  deno2: number;

  @Column({ name: 'cant_2', default: 0 })
  cant2: number;

  @Column({ name: 'total_2', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total2: number;

  @Column({ name: 'deno_1', default: 1 })
  deno1: number;

  @Column({ name: 'cant_1', default: 0 })
  cant1: number;

  @Column({ name: 'total_1', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total1: number;

  @Column({ name: 'total_general', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalGeneral: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
}

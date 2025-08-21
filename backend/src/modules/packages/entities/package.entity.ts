import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PhoneLine } from '../../phone-lines/entities/phone-line.entity';

@Entity('tbl_paquetes')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'telefonica_id' })
  telefonicaId: number;

  @Column()
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;


  @ManyToOne(() => PhoneLine)
  @JoinColumn({ name: 'telefonica_id' })
  telefonica: PhoneLine;
}

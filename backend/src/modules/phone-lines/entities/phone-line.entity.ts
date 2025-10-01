import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tbl_lineas_telefonicas' })
export class PhoneLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  // Campos de fecha eliminados porque no existen en la tabla
}

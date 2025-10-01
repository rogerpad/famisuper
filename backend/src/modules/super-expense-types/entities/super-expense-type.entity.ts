import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tbl_tipo_egresos')
export class SuperExpenseType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tbl_tipos_proveedor' })
export class ProviderType {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  descripcion: string;

  @Column({ type: 'boolean' })
  activo: boolean;
}

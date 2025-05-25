import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProviderType } from '../../provider-types/entities/provider-type.entity';

@Entity({ name: 'tbl_proveedores' })
export class Provider {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'tipo_proveedor_id', type: 'bigint' })
  tipoProveedorId: number;

  @ManyToOne(() => ProviderType)
  @JoinColumn({ name: 'tipo_proveedor_id' })
  tipoProveedor: ProviderType;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rtn: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contacto: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'boolean' })
  activo: boolean;

  @Column({ name: 'fecha_registro', type: 'timestamptz' })
  fechaRegistro: Date;
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tbl_documento_pagos')
export class PaymentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;
}

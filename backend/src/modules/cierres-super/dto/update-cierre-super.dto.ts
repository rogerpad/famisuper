import { IsNumber, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCierreSuperDto {
  @IsOptional()
  @IsNumber()
  usuarioId?: number;

  @IsOptional()
  @IsNumber()
  efectivoInicial?: number;

  @IsOptional()
  @IsNumber()
  adicionalCasa?: number;

  @IsOptional()
  @IsNumber()
  adicionalAgente?: number;

  @IsOptional()
  @IsNumber()
  ventaContado?: number;

  @IsOptional()
  @IsNumber()
  ventaCredito?: number;

  @IsOptional()
  @IsNumber()
  ventaPos?: number;

  @IsOptional()
  @IsNumber()
  transfOccidente?: number;

  @IsOptional()
  @IsNumber()
  transfAtlantida?: number;

  @IsOptional()
  @IsNumber()
  transfBac?: number;

  @IsOptional()
  @IsNumber()
  transfBanpais?: number;

  @IsOptional()
  @IsNumber()
  totalSpv?: number;

  @IsOptional()
  @IsNumber()
  abonoCredito?: number;

  @IsOptional()
  @IsNumber()
  ventaSaldo?: number;

  @IsOptional()
  @IsNumber()
  pagoProductos?: number;

  @IsOptional()
  @IsNumber()
  gastos?: number;

  @IsOptional()
  @IsNumber()
  prestaAgentes?: number;

  @IsOptional()
  @IsNumber()
  efectivoTotal?: number;

  @IsOptional()
  @IsNumber()
  efectivoCajaF?: number;

  @IsOptional()
  @IsNumber()
  efectivoCierreTurno?: number;

  @IsOptional()
  @IsNumber()
  faltanteSobrante?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaCierre?: Date;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

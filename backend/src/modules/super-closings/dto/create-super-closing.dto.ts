import { IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSuperClosingDto {
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsNotEmpty()
  @IsNumber()
  efectivoInicial: number;

  @IsNotEmpty()
  @IsNumber()
  adicionalCasa: number;

  @IsNotEmpty()
  @IsNumber()
  adicionalAgente: number;

  @IsNotEmpty()
  @IsNumber()
  ventaContado: number;

  @IsNotEmpty()
  @IsNumber()
  ventaCredito: number;

  @IsNotEmpty()
  @IsNumber()
  ventaPos: number;

  @IsNotEmpty()
  @IsNumber()
  transfOccidente: number;

  @IsNotEmpty()
  @IsNumber()
  transfAtlantida: number;

  @IsNotEmpty()
  @IsNumber()
  transfBac: number;

  @IsNotEmpty()
  @IsNumber()
  transfBanpais: number;

  @IsNotEmpty()
  @IsNumber()
  totalSpv: number;

  @IsNotEmpty()
  @IsNumber()
  abonoCredito: number;

  @IsNotEmpty()
  @IsNumber()
  ventaSaldo: number;

  @IsNotEmpty()
  @IsNumber()
  pagoProductos: number;

  @IsNotEmpty()
  @IsNumber()
  gastos: number;

  @IsNotEmpty()
  @IsNumber()
  prestaAgentes: number;

  @IsNotEmpty()
  @IsNumber()
  efectivoTotal: number;

  @IsNotEmpty()
  @IsNumber()
  efectivoCajaF: number;

  @IsNotEmpty()
  @IsNumber()
  efectivoCierreTurno: number;

  @IsNotEmpty()
  @IsNumber()
  faltanteSobrante: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaCierre?: Date;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

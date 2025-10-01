import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBalanceSaleDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  usuarioId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  telefonicaId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  flujoSaldoId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paqueteId?: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cantidad: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  monto: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  fecha: Date;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  activo: boolean = true;
}

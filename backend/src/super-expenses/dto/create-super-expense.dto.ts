import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSuperExpenseDto {
  @IsNotEmpty()
  @IsNumber()
  tipoEgresoId: number;

  @IsOptional()
  @IsString()
  descripcionEgreso?: string;

  @IsOptional()
  @IsNumber()
  documentoPagoId?: number;

  @IsOptional()
  @IsString()
  nroFactura?: string;

  @IsOptional()
  @IsNumber()
  excento?: number;

  @IsOptional()
  @IsNumber()
  gravado?: number;

  @IsOptional()
  @IsNumber()
  impuesto?: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsNumber()
  formaPagoId: number;

  @IsNotEmpty()
  @Type(() => Date)
  fechaEgreso: Date;
  
  @IsNotEmpty()
  @IsString()
  hora: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}

import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateFormulaConfigDto {
  @IsNotEmpty()
  @IsNumber()
  proveedorId: number;

  @IsNotEmpty()
  @IsNumber()
  tipoTransaccionId: number;

  @IsNotEmpty()
  @IsBoolean()
  incluirEnCalculo: boolean;

  @IsNotEmpty()
  @IsNumber()
  factorMultiplicador: number;
}

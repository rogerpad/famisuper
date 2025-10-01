import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class AdjustClosingDto {
  @IsNumber({}, { message: 'El monto de ajuste debe ser un número' })
  @IsNotEmpty({ message: 'El monto de ajuste es requerido' })
  adjustmentAmount: number;

  @IsString({ message: 'La justificación debe ser un texto' })
  @IsNotEmpty({ message: 'La justificación es requerida' })
  @MinLength(10, { message: 'La justificación debe tener al menos 10 caracteres' })
  justification: string;
}

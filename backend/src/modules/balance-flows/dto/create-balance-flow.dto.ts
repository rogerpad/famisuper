import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBalanceFlowDto {
  @IsNotEmpty({ message: 'El ID de la línea telefónica es requerido' })
  @IsNumber({}, { message: 'El ID de la línea telefónica debe ser un número' })
  telefonicaId: number;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El saldo inicial es requerido' })
  @IsNumber({}, { message: 'El saldo inicial debe ser un número' })
  @Type(() => Number)
  saldoInicial: number;

  @IsNotEmpty({ message: 'El saldo comprado es requerido' })
  @IsNumber({}, { message: 'El saldo comprado debe ser un número' })
  @Type(() => Number)
  saldoComprado: number;

  @IsNotEmpty({ message: 'El saldo vendido es requerido' })
  @IsNumber({}, { message: 'El saldo vendido debe ser un número' })
  @Type(() => Number)
  saldoVendido: number;

  @IsNotEmpty({ message: 'El saldo final es requerido' })
  @IsNumber({}, { message: 'El saldo final debe ser un número' })
  @Type(() => Number)
  saldoFinal: number;

  @IsNotEmpty({ message: 'La fecha es requerida' })
  @Type(() => Date)
  @IsDate({ message: 'El formato de fecha es inválido' })
  fecha: Date;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo?: boolean;
}

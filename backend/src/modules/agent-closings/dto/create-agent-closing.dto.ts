import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentClosingDto {
  @ApiProperty({ description: 'ID del usuario que crea el cierre' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId: number;

  @ApiProperty({ description: 'ID del proveedor (agente)' })
  @IsNotEmpty({ message: 'El proveedor es requerido' })
  @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
  proveedorId: number;

  @ApiProperty({ description: 'Fecha del cierre' })
  @IsNotEmpty({ message: 'La fecha de cierre es requerida' })
  @IsDateString({}, { message: 'La fecha de cierre debe ser una fecha válida' })
  fechaCierre: string;

  @ApiProperty({ description: 'Saldo inicial del cierre' })
  @IsNotEmpty({ message: 'El saldo inicial es requerido' })
  @IsNumber({}, { message: 'El saldo inicial debe ser un número' })
  saldoInicial: number;

  @ApiProperty({ description: 'Adicional CTA del cierre', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'El adicional CTA debe ser un número' })
  adicionalCta?: number = 0;

  @ApiProperty({ description: 'Resultado final del cierre' })
  @IsNotEmpty({ message: 'El resultado final es requerido' })
  @IsNumber({}, { message: 'El resultado final debe ser un número' })
  resultadoFinal: number;

  @ApiProperty({ description: 'Saldo final del cierre' })
  @IsNotEmpty({ message: 'El saldo final es requerido' })
  @IsNumber({}, { message: 'El saldo final debe ser un número' })
  saldoFinal: number;

  @ApiProperty({ description: 'Diferencia del cierre' })
  @IsNotEmpty({ message: 'La diferencia es requerida' })
  @IsNumber({}, { message: 'La diferencia debe ser un número' })
  diferencia: number;

  @ApiProperty({ description: 'Observaciones del cierre', required: false })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un texto' })
  observaciones?: string;

  @ApiProperty({ description: 'Estado del cierre', default: true })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  estado?: boolean = true;

  @ApiProperty({ description: 'ID del turno asociado al cierre', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del turno debe ser un número' })
  turnoId?: number;
}

import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsPositive, Min, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Fecha de la transacción', example: '2025-05-24' })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha: string;

  @ApiProperty({ description: 'Hora de la transacción', example: '14:30' })
  @IsString()
  @IsNotEmpty({ message: 'La hora es requerida' })
  hora: string;

  @ApiProperty({ description: 'ID del usuario que registra la transacción', example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'El usuario es requerido' })
  usuarioId: number;

  @ApiProperty({ description: 'ID del agente (proveedor) asociado a la transacción', example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'El agente es requerido' })
  agenteId: number;

  @ApiProperty({ description: 'ID del tipo de transacción', example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'El tipo de transacción es requerido' })
  tipoTransaccionId: number;

  @ApiProperty({ description: 'Valor de la transacción', example: 1000.00 })
  @IsNumber()
  @IsNotEmpty({ message: 'El valor es requerido' })
  @IsPositive({ message: 'El valor debe ser positivo' })
  @Min(0.01, { message: 'El valor mínimo es 0.01' })
  valor: number;

  @ApiProperty({ description: 'Observación o nota sobre la transacción', example: 'Pago de comisión', required: false })
  @IsString()
  @IsOptional()
  observacion?: string;

  @ApiProperty({ description: 'Estado de la transacción (1: activa)', example: 1, default: 1 })
  @IsInt()
  @IsOptional()
  estado: number = 1;
}

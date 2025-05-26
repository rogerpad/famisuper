import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionTypeDto {
  @ApiProperty({ description: 'Nombre del tipo de transacción', example: 'Venta' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @ApiProperty({ description: 'Descripción del tipo de transacción', example: 'Transacción de venta de productos', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'La descripción no puede exceder los 100 caracteres' })
  descripcion?: string;

  @ApiProperty({ description: 'Estado del tipo de transacción', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

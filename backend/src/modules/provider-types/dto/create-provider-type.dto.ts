import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderTypeDto {
  @ApiProperty({ description: 'Nombre del tipo de proveedor', example: 'Mayorista' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @ApiProperty({ description: 'Descripción del tipo de proveedor', example: 'Proveedores que venden al por mayor', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'La descripción no puede exceder los 100 caracteres' })
  descripcion?: string;

  @ApiProperty({ description: 'Estado del tipo de proveedor', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

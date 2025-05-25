import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, MaxLength, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ description: 'ID del tipo de proveedor', example: 1 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'El tipo de proveedor es requerido' })
  tipoProveedorId: number;

  @ApiProperty({ description: 'Nombre del proveedor', example: 'Distribuidora XYZ' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @ApiProperty({ description: 'RTN del proveedor', example: '08019995123456', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'El RTN no puede exceder los 20 caracteres' })
  rtn?: string;

  @ApiProperty({ description: 'Teléfono del proveedor', example: '+504 9876-5432', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no puede exceder los 20 caracteres' })
  telefono?: string;

  @ApiProperty({ description: 'Nombre del contacto', example: 'Juan Pérez', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El contacto no puede exceder los 100 caracteres' })
  contacto?: string;

  @ApiProperty({ description: 'Notas adicionales sobre el proveedor', example: 'Entrega los lunes y miércoles', required: false })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiProperty({ description: 'Estado del proveedor', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

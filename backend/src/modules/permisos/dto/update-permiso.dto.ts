import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreatePermisoDto } from './create-permiso.dto';

export class UpdatePermisoDto extends PartialType(CreatePermisoDto) {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'El módulo debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El módulo no puede tener más de 50 caracteres' })
  modulo?: string;
}

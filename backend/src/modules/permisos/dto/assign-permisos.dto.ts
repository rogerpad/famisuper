import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class AssignPermisosDto {
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  @IsNumber({}, { message: 'El ID del rol debe ser un número' })
  rolId: number;

  @IsNotEmpty({ message: 'La lista de permisos es requerida' })
  @IsArray({ message: 'Los permisos deben ser un arreglo de IDs' })
  permisosIds: number[];
}

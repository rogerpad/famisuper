import { IsString, IsBoolean, IsOptional, MaxLength, IsNumber, IsArray } from 'class-validator';

export class CreateTurnoDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(5)
  horaInicio: string;

  @IsString()
  @MaxLength(5)
  horaFin: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;
  
  // usuarioId ha sido eliminado ya que la columna no existe más en la tabla
  
  @IsArray()
  @IsOptional()
  usuariosIds?: number[];
}

import { IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveCashCountDto {
  @IsNumber()
  usuarioId: number;
  
  // NOTA: La columna turno_id no existe actualmente en la base de datos
  // Se ha comentado temporalmente hasta que se realice la migración
  // @IsOptional()
  // @IsNumber()
  // turnoId?: number;

  // Denominación de 500
  @IsOptional()
  @IsNumber()
  deno500?: number;

  @IsOptional()
  @IsNumber()
  cant500?: number;

  @IsOptional()
  @IsNumber()
  total500?: number;

  // Denominación de 200
  @IsOptional()
  @IsNumber()
  deno200?: number;

  @IsOptional()
  @IsNumber()
  cant200?: number;

  @IsOptional()
  @IsNumber()
  total200?: number;

  // Denominación de 100
  @IsOptional()
  @IsNumber()
  deno100?: number;

  @IsOptional()
  @IsNumber()
  cant100?: number;

  @IsOptional()
  @IsNumber()
  total100?: number;

  // Denominación de 50
  @IsOptional()
  @IsNumber()
  deno50?: number;

  @IsOptional()
  @IsNumber()
  cant50?: number;

  @IsOptional()
  @IsNumber()
  total50?: number;

  // Denominación de 20
  @IsOptional()
  @IsNumber()
  deno20?: number;

  @IsOptional()
  @IsNumber()
  cant20?: number;

  @IsOptional()
  @IsNumber()
  total20?: number;

  // Denominación de 10
  @IsOptional()
  @IsNumber()
  deno10?: number;

  @IsOptional()
  @IsNumber()
  cant10?: number;

  @IsOptional()
  @IsNumber()
  total10?: number;

  // Denominación de 5
  @IsOptional()
  @IsNumber()
  deno5?: number;

  @IsOptional()
  @IsNumber()
  cant5?: number;

  @IsOptional()
  @IsNumber()
  total5?: number;

  // Denominación de 2
  @IsOptional()
  @IsNumber()
  deno2?: number;

  @IsOptional()
  @IsNumber()
  cant2?: number;

  @IsOptional()
  @IsNumber()
  total2?: number;

  // Denominación de 1
  @IsOptional()
  @IsNumber()
  deno1?: number;

  @IsOptional()
  @IsNumber()
  cant1?: number;

  @IsOptional()
  @IsNumber()
  total1?: number;

  @IsNumber()
  totalGeneral: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}

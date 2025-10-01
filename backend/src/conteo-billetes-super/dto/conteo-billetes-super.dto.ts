import { IsNumber, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class ConteoBilletesSuperDto {
  @IsNumber()
  id: number;

  @IsNumber()
  usuarioId: number;

  @IsNumber()
  deno500: number;

  @IsNumber()
  cant500: number;

  @IsNumber()
  total500: number;

  @IsNumber()
  deno200: number;

  @IsNumber()
  cant200: number;

  @IsNumber()
  total200: number;

  @IsNumber()
  deno100: number;

  @IsNumber()
  cant100: number;

  @IsNumber()
  total100: number;

  @IsNumber()
  deno50: number;

  @IsNumber()
  cant50: number;

  @IsNumber()
  total50: number;

  @IsNumber()
  deno20: number;

  @IsNumber()
  cant20: number;

  @IsNumber()
  total20: number;

  @IsNumber()
  deno10: number;

  @IsNumber()
  cant10: number;

  @IsNumber()
  total10: number;

  @IsNumber()
  deno5: number;

  @IsNumber()
  cant5: number;

  @IsNumber()
  total5: number;

  @IsNumber()
  deno2: number;

  @IsNumber()
  cant2: number;

  @IsNumber()
  total2: number;

  @IsNumber()
  deno1: number;

  @IsNumber()
  cant1: number;

  @IsNumber()
  total1: number;

  @IsNumber()
  totalGeneral: number;

  @IsBoolean()
  activo: boolean;

  @IsDate()
  @Type(() => Date)
  fecha: Date;

  // Información adicional para mostrar en el frontend
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

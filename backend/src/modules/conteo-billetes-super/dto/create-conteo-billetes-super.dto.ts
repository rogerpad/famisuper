import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConteoBilletesSuperDto {
  @IsNumber()
  usuarioId: number;

  @IsNumber()
  @IsOptional()
  deno500?: number = 500;

  @IsNumber()
  @Type(() => Number)
  cant500: number = 0;

  @IsNumber()
  @IsOptional()
  total500?: number;

  @IsNumber()
  @IsOptional()
  deno200?: number = 200;

  @IsNumber()
  @Type(() => Number)
  cant200: number = 0;

  @IsNumber()
  @IsOptional()
  total200?: number;

  @IsNumber()
  @IsOptional()
  deno100?: number = 100;

  @IsNumber()
  @Type(() => Number)
  cant100: number = 0;

  @IsNumber()
  @IsOptional()
  total100?: number;

  @IsNumber()
  @IsOptional()
  deno50?: number = 50;

  @IsNumber()
  @Type(() => Number)
  cant50: number = 0;

  @IsNumber()
  @IsOptional()
  total50?: number;

  @IsNumber()
  @IsOptional()
  deno20?: number = 20;

  @IsNumber()
  @Type(() => Number)
  cant20: number = 0;

  @IsNumber()
  @IsOptional()
  total20?: number;

  @IsNumber()
  @IsOptional()
  deno10?: number = 10;

  @IsNumber()
  @Type(() => Number)
  cant10: number = 0;

  @IsNumber()
  @IsOptional()
  total10?: number;

  @IsNumber()
  @IsOptional()
  deno5?: number = 5;

  @IsNumber()
  @Type(() => Number)
  cant5: number = 0;

  @IsNumber()
  @IsOptional()
  total5?: number;

  @IsNumber()
  @IsOptional()
  deno2?: number = 2;

  @IsNumber()
  @Type(() => Number)
  cant2: number = 0;

  @IsNumber()
  @IsOptional()
  total2?: number;

  @IsNumber()
  @IsOptional()
  deno1?: number = 1;

  @IsNumber()
  @Type(() => Number)
  cant1: number = 0;

  @IsNumber()
  @IsOptional()
  total1?: number;

  @IsNumber()
  @IsOptional()
  totalGeneral?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;
}

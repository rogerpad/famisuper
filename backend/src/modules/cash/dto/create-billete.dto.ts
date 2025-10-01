import { IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateBilleteDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  billete: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalBillete: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsNumber()
  turnoId?: number;
}

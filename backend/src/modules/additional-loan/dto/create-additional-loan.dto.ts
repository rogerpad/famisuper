import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateAdditionalLoanDto {
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsNotEmpty()
  @IsString()
  acuerdo: string;

  @IsNotEmpty()
  @IsString()
  origen: string;

  @IsNotEmpty()
  @IsNumber()
  monto: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

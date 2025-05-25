import { IsString, IsEmail, IsBoolean, IsNotEmpty, IsOptional, IsNumber, MinLength, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre de usuario único', example: 'juanperez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez', required: false })
  @IsString()
  @IsOptional()
  apellido?: string;

  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan.perez@example.com', required: false })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'ID del rol asignado al usuario', example: 1 })
  @IsNumber()
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol_id: number;
  
  @ApiProperty({ description: 'Estado del usuario (activo/inactivo)', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

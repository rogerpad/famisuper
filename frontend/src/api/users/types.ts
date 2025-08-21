// Definición de tipos para usuarios
export interface User {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email?: string;
  rolId?: number;
  rol?: {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  };
  activo?: boolean;
}

export interface CreateUserDto {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email?: string;
  rolId: number;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

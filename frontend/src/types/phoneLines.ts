export interface PhoneLine {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePhoneLineDto {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface UpdatePhoneLineDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

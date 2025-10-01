export interface PhoneLine {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  // Campos de fecha eliminados porque no existen en la tabla
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

export interface PhoneLineResponse {
  data: PhoneLine[];
  total: number;
  page: number;
  limit: number;
}

export interface PhoneLineFormData {
  id?: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

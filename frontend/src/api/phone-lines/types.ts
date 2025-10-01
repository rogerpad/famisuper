export interface PhoneLine {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface PhoneLineFormData {
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface PaymentMethod {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CreatePaymentMethodDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdatePaymentMethodDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

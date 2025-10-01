export interface PaymentDocument {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CreatePaymentDocumentDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdatePaymentDocumentDto {
  nombre?: string;
  descripcion?: string | null;
}

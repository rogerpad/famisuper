import { User } from '../users/types';
import { SuperExpenseType } from '../super-expense-types/types';
import { PaymentDocument } from '../payment-documents/types';
import { PaymentMethod } from '../payment-methods/types';

export interface SuperExpense {
  id: number;
  usuarioId: number;
  usuario?: User;
  tipoEgresoId: number;
  tipoEgreso?: SuperExpenseType;
  descripcionEgreso?: string;
  documentoPagoId?: number;
  documentoPago?: PaymentDocument;
  nroFactura?: string;
  excento: number;
  gravado: number;
  impuesto: number;
  total: number;
  formaPagoId: number;
  formaPago?: PaymentMethod;
  fechaEgreso: string | Date;
  hora: string;
  activo: boolean;
  cajaNumero?: number | null;
}

export interface CreateSuperExpenseDto {
  tipoEgresoId: number;
  descripcionEgreso?: string;
  documentoPagoId?: number;
  nroFactura?: string;
  excento?: number;
  gravado?: number;
  impuesto?: number;
  total: number;
  formaPagoId: number;
  fechaEgreso: string | Date;
  hora: string;
  activo?: boolean;
}

export interface UpdateSuperExpenseDto extends Partial<CreateSuperExpenseDto> {}

export interface SuperExpenseFilters {
  startDate?: string | Date;
  endDate?: string | Date;
  showInactive?: boolean;
}

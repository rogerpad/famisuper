import { User } from '../users/types';
import { PhoneLine } from '../phone-lines/types';
import { BalanceFlow } from '../balance-flows/types';

export interface BalanceSale {
  id: number;
  usuarioId: number;
  usuario?: User;
  telefonicaId: number;
  telefonica?: PhoneLine;
  flujoSaldoId: number;
  flujoSaldo?: BalanceFlow;
  paqueteId?: number;
  cantidad: number;
  monto: number;
  fecha: Date;
  observacion?: string;
  activo: boolean;
}

export interface BalanceSaleFormData {
  usuarioId: number;
  telefonicaId: number;
  flujoSaldoId: number;
  paqueteId?: number;
  cantidad: number;
  monto: number;
  fecha: Date | string; // Aceptar tanto Date como string
  observacion?: string;
  activo?: boolean;
}

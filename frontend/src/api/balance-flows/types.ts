import { PhoneLine } from '../phoneLines/types';

export interface BalanceFlow {
  id: number;
  telefonicaId: number;
  telefonica?: PhoneLine;
  nombre: string;
  saldoInicial: number;
  saldoComprado: number;
  saldoVendido: number;
  saldoFinal: number;
  fecha: string;
  activo: boolean;
}

export interface CreateBalanceFlowDto {
  telefonicaId: number;
  nombre: string;
  saldoInicial: number;
  saldoComprado: number;
  saldoVendido: number;
  saldoFinal: number;
  fecha: string;
  activo: boolean;
}

export interface UpdateBalanceFlowDto {
  telefonicaId?: number;
  nombre?: string;
  saldoInicial?: number;
  saldoComprado?: number;
  saldoVendido?: number;
  saldoFinal?: number;
  fecha?: string;
  activo?: boolean;
}

export interface BalanceFlowResponse {
  data: BalanceFlow[];
  total: number;
  page: number;
  limit: number;
}

export interface BalanceFlowFormData {
  id?: number;
  telefonicaId: number;
  nombre: string;
  saldoInicial: number;
  saldoComprado: number;
  saldoVendido: number;
  saldoFinal: number;
  fecha: string;
  activo: boolean;
}

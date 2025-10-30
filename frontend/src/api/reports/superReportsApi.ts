import api from '../api';

const API_URL = '/reports/super';

export interface SuperClosingReportData {
  id: number;
  fecha: Date;
  usuario: string;
  cajaNumero: number;
  efectivoInicial: number;
  efectivoTotal: number;
  efectivoCierreTurno: number;
  faltanteSobrante: number;
  gastos: number;
}

export interface SuperClosingsReportResponse {
  cierres: SuperClosingReportData[];
  totales: {
    totalEfectivoInicial: number;
    totalEfectivoFinal: number;
    totalGastos: number;
    totalFaltantes: number;
    totalSobrantes: number;
  };
}

export interface SuperExpenseReportData {
  id: number;
  fecha: Date;
  tipoEgreso: string;
  descripcion: string;
  total: number;
  formaPago: string;
  usuario: string;
  cajaNumero: number;
}

export interface SuperExpensesReportResponse {
  egresos: SuperExpenseReportData[];
  resumenPorTipo: {
    tipo: string;
    cantidad: number;
    total: number;
  }[];
  totales: {
    totalGeneral: number;
    promedioDiario: number;
    cantidadTotal: number;
  };
}

export interface BalanceSaleReportData {
  id: number;
  fecha: Date;
  telefonica: string;
  cantidad: number;
  monto: number;
  usuario: string;
  cajaNumero: number;
}

export interface BalanceFlowReportData {
  id: number;
  fecha: Date;
  telefonica: string;
  nombre: string;
  saldoVendido: number;
  saldoFinal: number;
}

export interface BalanceSalesReportResponse {
  ventas: BalanceSaleReportData[];
  flujos: BalanceFlowReportData[];
  totales: {
    totalVentas: number;
    totalMontoVentas: number;
    totalSaldoVendido: number;
  };
}

const superReportsApi = {
  // Reporte 1: Cierres Super
  getSuperClosingsReport: async (
    startDate?: string,
    endDate?: string,
    cajaNumero?: number,
    usuarioId?: number,
  ): Promise<SuperClosingsReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (cajaNumero) params.append('cajaNumero', cajaNumero.toString());
    if (usuarioId) params.append('usuarioId', usuarioId.toString());

    const response = await api.get(`${API_URL}/closings?${params.toString()}`);
    return response.data;
  },

  exportSuperClosingsToExcel: async (
    startDate?: string,
    endDate?: string,
    cajaNumero?: number,
    usuarioId?: number,
  ): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (cajaNumero) params.append('cajaNumero', cajaNumero.toString());
    if (usuarioId) params.append('usuarioId', usuarioId.toString());

    const response = await api.get(`${API_URL}/closings/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cierres_super_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Reporte 2: Egresos y Gastos
  getSuperExpensesReport: async (
    startDate?: string,
    endDate?: string,
    tipoEgresoId?: number,
    cajaNumero?: number,
  ): Promise<SuperExpensesReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (tipoEgresoId) params.append('tipoEgresoId', tipoEgresoId.toString());
    if (cajaNumero) params.append('cajaNumero', cajaNumero.toString());

    const response = await api.get(`${API_URL}/expenses?${params.toString()}`);
    return response.data;
  },

  exportSuperExpensesToExcel: async (
    startDate?: string,
    endDate?: string,
    tipoEgresoId?: number,
    cajaNumero?: number,
  ): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (tipoEgresoId) params.append('tipoEgresoId', tipoEgresoId.toString());
    if (cajaNumero) params.append('cajaNumero', cajaNumero.toString());

    const response = await api.get(`${API_URL}/expenses/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `egresos_super_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Reporte 3: Ventas de Saldo
  getBalanceSalesReport: async (
    startDate?: string,
    endDate?: string,
    cajaNumero?: number,
  ): Promise<BalanceSalesReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (cajaNumero) params.append('cajaNumero', cajaNumero.toString());

    const response = await api.get(`${API_URL}/balance-sales?${params.toString()}`);
    return response.data;
  },

  exportBalanceSalesToExcel: async (
    startDate?: string,
    endDate?: string,
    cajaNumero?: number,
  ): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (cajaNumero) params.append('cajaNumero', cajaNumero.toString());

    const response = await api.get(`${API_URL}/balance-sales/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ventas_saldo_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default superReportsApi;

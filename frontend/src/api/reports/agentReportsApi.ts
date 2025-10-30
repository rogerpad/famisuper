import api from '../api';

const API_URL = '/reports/agent';

export interface AgentClosingReportData {
  id: number;
  fecha: Date;
  agente: string;
  saldoInicial: number;
  adicionalCta: number;
  resultadoFinal: number;
  saldoFinal: number;
  diferencia: number;
}

export interface AgentClosingsReportResponse {
  cierres: AgentClosingReportData[];
  totales: {
    totalSaldoInicial: number;
    totalSaldoFinal: number;
    totalDiferencias: number;
  };
}

export interface AgentTransactionReportData {
  id: number;
  fecha: Date;
  agente: string;
  tipoTransaccion: string;
  valor: number;
  observaciones: string;
}

export interface AgentTransactionsReportResponse {
  transacciones: AgentTransactionReportData[];
  resumenAgentes: {
    agente: string;
    total: number;
  }[];
  totales: {
    totalTransacciones: number;
    totalValor: number;
    promedio: number;
  };
}

export interface AgentConsolidatedReportResponse {
  resumen: {
    agentesActivos: number;
    totalTransacciones: number;
    totalValor: number;
    promedioPorTransaccion: number;
  };
  porTipo: {
    tipo: string;
    cantidad: number;
    total: number;
  }[];
  topAgentes: {
    agente: string;
    transacciones: number;
    total: number;
  }[];
}

const agentReportsApi = {
  // Reporte 1: Cierres de Agentes
  getAgentClosingsReport: async (
    startDate?: string,
    endDate?: string,
    proveedorId?: number,
  ): Promise<AgentClosingsReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (proveedorId) params.append('proveedorId', proveedorId.toString());

    const response = await api.get(`${API_URL}/closings?${params.toString()}`);
    return response.data;
  },

  exportAgentClosingsToExcel: async (
    startDate?: string,
    endDate?: string,
    proveedorId?: number,
  ): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (proveedorId) params.append('proveedorId', proveedorId.toString());

    const response = await api.get(`${API_URL}/closings/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cierres_agentes_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Reporte 2: Transacciones por Agente
  getAgentTransactionsReport: async (
    startDate?: string,
    endDate?: string,
    agenteId?: number,
    tipoTransaccionId?: number,
  ): Promise<AgentTransactionsReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (agenteId) params.append('agenteId', agenteId.toString());
    if (tipoTransaccionId) params.append('tipoTransaccionId', tipoTransaccionId.toString());

    const response = await api.get(`${API_URL}/transactions?${params.toString()}`);
    return response.data;
  },

  exportAgentTransactionsToExcel: async (
    startDate?: string,
    endDate?: string,
    agenteId?: number,
    tipoTransaccionId?: number,
  ): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (agenteId) params.append('agenteId', agenteId.toString());
    if (tipoTransaccionId) params.append('tipoTransaccionId', tipoTransaccionId.toString());

    const response = await api.get(`${API_URL}/transactions/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transacciones_agentes_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Reporte 3: Consolidado de Operación Agente
  getAgentConsolidatedReport: async (
    startDate?: string,
    endDate?: string,
  ): Promise<AgentConsolidatedReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`${API_URL}/consolidated?${params.toString()}`);
    return response.data;
  },

  exportAgentConsolidatedToExcel: async (
    startDate?: string,
    endDate?: string,
  ): Promise<void> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`${API_URL}/consolidated/excel?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `consolidado_agentes_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default agentReportsApi;

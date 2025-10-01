import api from '../api';

export interface TransactionSummary {
  tipoTransaccion: string;
  tipoTransaccionId: number;
  agentes: {
    [agenteId: string]: number; // Monto por agente
  };
  efectivo: number; // Total en efectivo
}

export interface TransactionReportData {
  transactionTypes: TransactionSummary[];
  agentes: {
    id: number;
    nombre: string;
  }[];
  totales: {
    [agenteId: string]: number;
  };
  totalEfectivo: number;
  usuario?: {
    id: number;
    nombre: string;
    username: string;
  };
}

const reportsApi = {
  // Obtener resumen de transacciones por tipo y agente
  getTransactionSummary: async (): Promise<TransactionReportData> => {
    const response = await api.get('/reports/transactions-summary');
    return response.data;
  },

  // Exportar reporte a Excel
  exportToExcel: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/reports/transactions-summary/excel', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Imprimir reporte (obtener versión para imprimir)
  getPrintVersion: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    try {
      console.log('Solicitando PDF al servidor...');
      const response = await api.get('/reports/transactions-summary/print', { 
        params,
        responseType: 'blob'
      });
      console.log('Respuesta recibida:', response);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el PDF:', error);
      throw error;
    }
  }
};

export default reportsApi;

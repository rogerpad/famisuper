import api from '../api';

export interface AgentClosing {
  id: number;
  proveedorId: number;
  proveedor?: {
    id: number;
    nombre: string;
  };
  fechaCierre: string;
  saldoInicial: number;
  adicionalCta: number;
  resultadoFinal: number;
  saldoFinal: number;
  diferencia: number;
  observaciones: string | null;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateAgentClosingDto {
  proveedorId: number;
  fechaCierre: string;
  saldoInicial: number;
  adicionalCta: number;
  resultadoFinal: number;
  saldoFinal: number;
  diferencia: number;
  observaciones?: string;
  estado?: string;
}

export interface UpdateAgentClosingDto extends Partial<CreateAgentClosingDto> {}

export const agentClosingsApi = {
  // Obtener todos los cierres finales de agentes
  getAllAgentClosings: async (startDate?: string, endDate?: string): Promise<AgentClosing[]> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/agent-closings', { params });
    return response.data;
  },
  
  // Calcular el resultado final para un agente en un rango de fechas
  calculateResultadoFinal: async (proveedorId: number, startDate: string, endDate: string): Promise<number> => {
    const response = await api.get(`/formula-configs/provider/${proveedorId}/calculate`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Obtener un cierre final de agente por su ID
  getAgentClosingById: async (id: number): Promise<AgentClosing> => {
    const response = await api.get(`/agent-closings/${id}`);
    return response.data;
  },

  // Crear un nuevo cierre final de agente
  createAgentClosing: async (data: CreateAgentClosingDto): Promise<AgentClosing> => {
    const response = await api.post('/agent-closings', data);
    return response.data;
  },

  // Actualizar un cierre final de agente existente
  updateAgentClosing: async (id: number, data: UpdateAgentClosingDto): Promise<AgentClosing> => {
    const response = await api.patch(`/agent-closings/${id}`, data);
    return response.data;
  },

  // Eliminar un cierre final de agente
  deleteAgentClosing: async (id: number): Promise<void> => {
    await api.delete(`/agent-closings/${id}`);
  },

  // Obtener todos los proveedores de tipo agente
  getAgentProviders: async () => {
    const response = await api.get('/providers/agent-type');
    return response.data;
  }
};

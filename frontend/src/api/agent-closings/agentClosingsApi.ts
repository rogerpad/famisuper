import api from '../api';
import agentClosingsMockApi from './agentClosingsMock';

// Bandera para usar mock o API real
const USE_MOCK = false; // Usando la API real para obtener datos de la base de datos

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
  turnoId?: number; // ID del turno asociado al cierre
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
  turnoId?: number; // ID del turno asociado al cierre
}

export interface UpdateAgentClosingDto extends Partial<CreateAgentClosingDto> {}

export const agentClosingsApi = {
  // Obtener todos los cierres finales de agentes
  getAllAgentClosings: async (startDate?: string, endDate?: string): Promise<AgentClosing[]> => {
    if (USE_MOCK) {
      return agentClosingsMockApi.getAllAgentClosings(startDate, endDate);
    }
    
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/agent-closings', { params });
    return response.data;
  },
  
  // Calcular el resultado final para un agente en un rango de fechas
  calculateResultadoFinal: async (proveedorId: number, startDate: string, endDate: string): Promise<number> => {
    if (USE_MOCK) {
      return agentClosingsMockApi.calculateResultadoFinal(proveedorId, startDate, endDate);
    }
    
    const response = await api.get(`/formula-configs/provider/${proveedorId}/calculate`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Obtener un cierre final de agente por su ID
  getAgentClosingById: async (id: number): Promise<AgentClosing> => {
    if (USE_MOCK) {
      return agentClosingsMockApi.getAgentClosingById(id);
    }
    
    const response = await api.get(`/agent-closings/${id}`);
    return response.data;
  },

  // Crear un nuevo cierre final de agente
  createAgentClosing: async (data: CreateAgentClosingDto): Promise<AgentClosing> => {
    if (USE_MOCK) {
      return agentClosingsMockApi.createAgentClosing(data);
    }
    
    // Logs detallados para depuración
    console.log('[API] Enviando datos al backend para crear cierre:', JSON.stringify(data, null, 2));
    console.log('[API] Valores específicos a verificar:');
    console.log('[API] - resultadoFinal:', data.resultadoFinal, typeof data.resultadoFinal);
    console.log('[API] - diferencia:', data.diferencia, typeof data.diferencia);
    
    try {
      const response = await api.post('/agent-closings', data);
      console.log('[API] Respuesta del backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[API] Error al crear cierre:', error.response?.data || error.message);
      throw error;
    }
  },

  // Actualizar un cierre final de agente
  updateAgentClosing: async (id: number, data: UpdateAgentClosingDto): Promise<AgentClosing> => {
    console.log('[AGENT_CLOSINGS_API] Actualizando cierre final con ID:', id);
    console.log('[AGENT_CLOSINGS_API] Datos recibidos:', data);
    
    // Validar el ID
    if (!id || isNaN(id) || id <= 0) {
      console.error('[AGENT_CLOSINGS_API] ID de cierre final inválido:', id);
      throw new Error(`ID de cierre final inválido: ${id}`);
    }
    
    try {
      // SOLUCIÓN SIMPLIFICADA: Asegurar que proveedorId y resultadoFinal sean números válidos
      const updateData = {
        ...data,
        // Convertir explícitamente a número si están presentes
        proveedorId: data.proveedorId !== undefined ? Number(data.proveedorId) : undefined,
        resultadoFinal: data.resultadoFinal !== undefined ? Number(data.resultadoFinal) : undefined
      };
      
      // Logs detallados para verificar los valores críticos - Usando console.warn para que sean más visibles
      console.warn('======== VERIFICACIÓN DE VALORES CRÍTICOS ANTES DE ENVIAR AL BACKEND ========');
      console.warn(`[AGENT_CLOSINGS_API] ID del cierre: ${id}`);
      console.warn(`[AGENT_CLOSINGS_API] Proveedor ID original: ${data.proveedorId} (${typeof data.proveedorId})`);
      console.warn(`[AGENT_CLOSINGS_API] Proveedor ID convertido: ${updateData.proveedorId} (${typeof updateData.proveedorId})`);
      console.warn(`[AGENT_CLOSINGS_API] Resultado Final original: ${data.resultadoFinal} (${typeof data.resultadoFinal})`);
      console.warn(`[AGENT_CLOSINGS_API] Resultado Final convertido: ${updateData.resultadoFinal} (${typeof updateData.resultadoFinal})`);
      console.warn('======== FIN DE VERIFICACIÓN ========');
      
      console.log('[AGENT_CLOSINGS_API] Datos completos a enviar:', updateData);
      
      const response = await api.patch<AgentClosing>(`/agent-closings/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('[AGENT_CLOSINGS_API] Error al actualizar cierre:', error.response?.data || error.message);
      throw error;
    }
  },

  // Eliminar un cierre final de agente
  deleteAgentClosing: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return agentClosingsMockApi.deleteAgentClosing(id);
    }
    
    await api.delete(`/agent-closings/${id}`);
  },

  // Obtener todos los proveedores de tipo agente
  getAgentProviders: async () => {
    if (USE_MOCK) {
      return agentClosingsMockApi.getAgentProviders();
    }
    
    const response = await api.get('/providers/agent-type');
    return response.data;
  }
};

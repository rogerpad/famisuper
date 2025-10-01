import api from '../api';

export interface FormulaConfig {
  id: number;
  proveedorId: number;
  proveedor?: {
    id: number;
    nombre: string;
  };
  tipoTransaccionId: number;
  tipoTransaccion?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  incluirEnCalculo: boolean;
  factorMultiplicador: number;
  sumaTotal: boolean;
}

export interface CreateFormulaConfigDto {
  proveedorId: number;
  tipoTransaccionId: number;
  incluirEnCalculo: boolean;
  factorMultiplicador: number;
}

export interface UpdateFormulaConfigDto {
  proveedorId?: number;
  tipoTransaccionId?: number;
  incluirEnCalculo?: boolean;
  factorMultiplicador?: number;
}

export interface BulkUpdateConfigDto {
  tipoTransaccionId: number;
  incluirEnCalculo: boolean;
  factorMultiplicador: number;
  sumaTotal: boolean;
}

// El cliente HTTP centralizado ya maneja la autenticación
const formulaConfigsApi = {
  // Obtener todas las configuraciones de fórmulas
  getAll: async (): Promise<FormulaConfig[]> => {
    const response = await api.get('/formula-configs');
    return response.data;
  },

  // Obtener configuraciones por proveedor
  getByProvider: async (providerId: number): Promise<FormulaConfig[]> => {
    const response = await api.get(`/formula-configs/provider/${providerId}`);
    return response.data;
  },

  // Obtener una configuración por ID
  getById: async (id: number): Promise<FormulaConfig> => {
    const response = await api.get(`/formula-configs/${id}`);
    return response.data;
  },

  // Crear una nueva configuración
  create: async (config: CreateFormulaConfigDto): Promise<FormulaConfig> => {
    const response = await api.post('/formula-configs', config);
    return response.data;
  },

  // Actualizar una configuración existente
  update: async (id: number, config: UpdateFormulaConfigDto): Promise<FormulaConfig> => {
    const response = await api.patch(`/formula-configs/${id}`, config);
    return response.data;
  },

  // Eliminar una configuración
  delete: async (id: number): Promise<void> => {
    await api.delete(`/formula-configs/${id}`);
  },

  // Actualizar configuraciones en masa para un proveedor
  bulkUpdateForProvider: async (providerId: number, configs: BulkUpdateConfigDto[]): Promise<FormulaConfig[]> => {
    const response = await api.post(`/formula-configs/provider/${providerId}/bulk-update`, configs);
    return response.data;
  },

  // Calcular el resultado final para un proveedor
  calculateResultadoFinal: async (providerId: number, startDate: string, endDate: string): Promise<number> => {
    const response = await api.get(`/formula-configs/provider/${providerId}/calculate`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};

export default formulaConfigsApi;

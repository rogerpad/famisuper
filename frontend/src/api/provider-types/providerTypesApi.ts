import api from '../api';

export interface ProviderType {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface CreateProviderTypeDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateProviderTypeDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

const providerTypesApi = {
  // Obtener todos los tipos de proveedor
  getAll: async (): Promise<ProviderType[]> => {
    const response = await api.get('/provider-types');
    return response.data;
  },

  // Obtener un tipo de proveedor por ID
  getById: async (id: number): Promise<ProviderType> => {
    const response = await api.get(`/provider-types/${id}`);
    return response.data;
  },

  // Crear un nuevo tipo de proveedor
  create: async (data: CreateProviderTypeDto): Promise<ProviderType> => {
    const response = await api.post('/provider-types', data);
    return response.data;
  },

  // Actualizar un tipo de proveedor existente
  update: async (id: number, data: UpdateProviderTypeDto): Promise<ProviderType> => {
    const response = await api.patch(`/provider-types/${id}`, data);
    return response.data;
  },

  // Eliminar un tipo de proveedor
  delete: async (id: number): Promise<void> => {
    await api.delete(`/provider-types/${id}`);
  }
};

export default providerTypesApi;

import api from '../api';
import { ProviderType } from '../provider-types/providerTypesApi';

export interface Provider {
  id: number;
  tipoProveedorId: number;
  tipoProveedor: ProviderType;
  nombre: string;
  rtn?: string;
  telefono?: string;
  contacto?: string;
  notas?: string;
  activo: boolean;
  fechaRegistro: string;
}

export interface CreateProviderDto {
  tipoProveedorId: number;
  nombre: string;
  rtn?: string;
  telefono?: string;
  contacto?: string;
  notas?: string;
  activo?: boolean;
}

export interface UpdateProviderDto {
  tipoProveedorId?: number;
  nombre?: string;
  rtn?: string;
  telefono?: string;
  contacto?: string;
  notas?: string;
  activo?: boolean;
}

const providersApi = {
  // Obtener todos los proveedores
  getAll: async (): Promise<Provider[]> => {
    const response = await api.get('/providers');
    return response.data;
  },

  // Obtener proveedores por tipo
  getByType: async (tipoProveedorId: number): Promise<Provider[]> => {
    const response = await api.get(`/providers?tipoProveedorId=${tipoProveedorId}`);
    return response.data;
  },

  // Obtener solo proveedores activos
  getActive: async (): Promise<Provider[]> => {
    const response = await api.get('/providers?activo=true');
    return response.data;
  },

  // Obtener un proveedor por ID
  getById: async (id: number): Promise<Provider> => {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  // Crear un nuevo proveedor
  create: async (data: CreateProviderDto): Promise<Provider> => {
    const response = await api.post('/providers', data);
    return response.data;
  },

  // Actualizar un proveedor existente
  update: async (id: number, data: UpdateProviderDto): Promise<Provider> => {
    const response = await api.patch(`/providers/${id}`, data);
    return response.data;
  },

  // Eliminar un proveedor
  delete: async (id: number): Promise<void> => {
    await api.delete(`/providers/${id}`);
  }
};

export default providersApi;

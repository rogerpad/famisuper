import api from '../api';
import transactionTypesMockApi from './transactionTypesMock';

// Bandera para usar mock o API real
const USE_MOCK = false; // Usando la API real conectada a la base de datos

export interface TransactionType {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface CreateTransactionTypeDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateTransactionTypeDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

const transactionTypesApi = {
  // Obtener todos los tipos de transacción
  getAll: async (): Promise<TransactionType[]> => {
    if (USE_MOCK) {
      return transactionTypesMockApi.getAll();
    }
    const response = await api.get('/transaction-types');
    return response.data;
  },

  // Obtener todos los tipos de transacción activos
  getActive: async (): Promise<TransactionType[]> => {
    if (USE_MOCK) {
      return transactionTypesMockApi.getActive();
    }
    const response = await api.get('/transaction-types/active');
    return response.data;
  },

  // Obtener un tipo de transacción por ID
  getById: async (id: number): Promise<TransactionType> => {
    if (USE_MOCK) {
      return transactionTypesMockApi.getById(id);
    }
    const response = await api.get(`/transaction-types/${id}`);
    return response.data;
  },

  // Crear un nuevo tipo de transacción
  create: async (data: CreateTransactionTypeDto): Promise<TransactionType> => {
    if (USE_MOCK) {
      return transactionTypesMockApi.create(data);
    }
    const response = await api.post('/transaction-types', data);
    return response.data;
  },

  // Actualizar un tipo de transacción existente
  update: async (id: number, data: UpdateTransactionTypeDto): Promise<TransactionType> => {
    if (USE_MOCK) {
      return transactionTypesMockApi.update(id, data);
    }
    const response = await api.patch(`/transaction-types/${id}`, data);
    return response.data;
  },

  // Eliminar un tipo de transacción
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return transactionTypesMockApi.delete(id);
    }
    await api.delete(`/transaction-types/${id}`);
  },
  
  // Cambiar el estado de un tipo de transacción (activar/desactivar)
  toggleStatus: async (id: number): Promise<TransactionType> => {
    if (USE_MOCK) {
      return transactionTypesMockApi.toggleStatus(id);
    }
    const response = await api.patch(`/transaction-types/${id}/toggle-status`);
    return response.data;
  }
};

export default transactionTypesApi;

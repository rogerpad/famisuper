import api from '../api';

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
    const response = await api.get('/transaction-types');
    return response.data;
  },

  // Obtener todos los tipos de transacción activos
  getActive: async (): Promise<TransactionType[]> => {
    const response = await api.get('/transaction-types/active');
    return response.data;
  },

  // Obtener un tipo de transacción por ID
  getById: async (id: number): Promise<TransactionType> => {
    const response = await api.get(`/transaction-types/${id}`);
    return response.data;
  },

  // Crear un nuevo tipo de transacción
  create: async (data: CreateTransactionTypeDto): Promise<TransactionType> => {
    const response = await api.post('/transaction-types', data);
    return response.data;
  },

  // Actualizar un tipo de transacción existente
  update: async (id: number, data: UpdateTransactionTypeDto): Promise<TransactionType> => {
    const response = await api.patch(`/transaction-types/${id}`, data);
    return response.data;
  },

  // Eliminar un tipo de transacción
  delete: async (id: number): Promise<void> => {
    await api.delete(`/transaction-types/${id}`);
  }
};

export default transactionTypesApi;

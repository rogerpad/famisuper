import api from '../api';

export interface Transaction {
  id: number;
  fecha: string;
  hora: string;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  agenteId: number;
  agente?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  tipoTransaccionId: number;
  tipoTransaccion?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  valor: number;
  observacion?: string;
  fechaRegistro: string;
}

export interface CreateTransactionDto {
  fecha: string;
  hora: string;
  usuarioId: number;
  agenteId: number;
  tipoTransaccionId: number;
  valor: number;
  observacion?: string;
}

export interface UpdateTransactionDto {
  fecha?: string;
  hora?: string;
  usuarioId?: number;
  agenteId?: number;
  tipoTransaccionId?: number;
  valor?: number;
  observacion?: string;
}

// El cliente HTTP centralizado ya maneja la autenticación

// Funciones para interactuar con la API de transacciones
const transactionsApi = {
  // Obtener todas las transacciones
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data;
  },

  // Obtener una transacción por ID
  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Crear una nueva transacción
  create: async (transaction: CreateTransactionDto): Promise<Transaction> => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  // Actualizar una transacción existente
  update: async (id: number, transaction: UpdateTransactionDto): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${id}`, transaction);
    return response.data;
  },

  // Eliminar una transacción
  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  // Obtener transacciones por rango de fechas
  getByDateRange: async (startDate: string, endDate: string): Promise<Transaction[]> => {
    const response = await api.get(
      `/transactions/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Obtener transacciones por agente
  getByAgent: async (agentId: number): Promise<Transaction[]> => {
    const response = await api.get(
      `/transactions/agent/${agentId}`
    );
    return response.data;
  },

  // Obtener transacciones por tipo de transacción
  getByTransactionType: async (typeId: number): Promise<Transaction[]> => {
    const response = await api.get(
      `/transactions/type/${typeId}`
    );
    return response.data;
  },
};

export default transactionsApi;

import api from '../api';
import turnosMockApi from './turnosMock';

// Bandera para usar mock o API real
const USE_MOCK = false; // Usando la API real conectada a la base de datos

export interface Turno {
  id: number;
  nombre: string;
  usuario_id: number;
  estado: string;
  descripcion?: string;
  activo: boolean;
  usuario?: {
    id: number;
    username: string;
    nombre: string;
    apellido?: string;
  };
}

export interface CreateTurnoDto {
  nombre: string;
  usuario_id: number;
  estado?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateTurnoDto {
  nombre?: string;
  usuario_id?: number;
  estado?: string;
  descripcion?: string;
  activo?: boolean;
}

const turnosApi = {
  // Obtener todos los turnos
  getAll: async (): Promise<Turno[]> => {
    if (USE_MOCK) {
      return turnosMockApi.getAll();
    }
    const response = await api.get('/turnos');
    return response.data;
  },

  // Obtener un turno por ID
  getById: async (id: number): Promise<Turno> => {
    if (USE_MOCK) {
      return turnosMockApi.getById(id);
    }
    const response = await api.get(`/turnos/${id}`);
    return response.data;
  },

  // Obtener turnos por usuario_id
  getByUsuarioId: async (usuarioId: number): Promise<Turno[]> => {
    if (USE_MOCK) {
      return turnosMockApi.getByUsuarioId(usuarioId);
    }
    const response = await api.get(`/turnos/usuario/${usuarioId}`);
    return response.data;
  },

  // Crear un nuevo turno
  create: async (turnoData: CreateTurnoDto): Promise<Turno> => {
    if (USE_MOCK) {
      return turnosMockApi.create(turnoData);
    }
    const response = await api.post('/turnos', turnoData);
    return response.data;
  },

  // Actualizar un turno existente
  update: async (id: number, turnoData: UpdateTurnoDto): Promise<Turno> => {
    try {
      if (USE_MOCK) {
        return turnosMockApi.update(id, turnoData);
      }
      const response = await api.patch(`/turnos/${id}`, turnoData);
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar turno:', error.response?.data || error.message);
      throw error;
    }
  },

  // Eliminar un turno
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return turnosMockApi.delete(id);
    }
    await api.delete(`/turnos/${id}`);
  }
};

export default turnosApi;

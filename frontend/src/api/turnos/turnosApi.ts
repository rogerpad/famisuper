import api from '../api';
import turnosMockApi from './turnosMock';

// Bandera para usar mock o API real
const USE_MOCK = false; // Usando la API real conectada a la base de datos

export interface Turno {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  descripcion?: string;
  activo: boolean;
  usuarioId?: number;
  usuario?: Usuario;
  usuarios?: Usuario[];
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido?: string;
}

export interface CreateTurnoDto {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  descripcion?: string;
  activo?: boolean;
  usuarioId?: number;
  usuariosIds?: number[];
}

export interface UpdateTurnoDto {
  nombre?: string;
  horaInicio?: string;
  horaFin?: string;
  descripcion?: string;
  activo?: boolean;
  usuarioId?: number;
  usuariosIds?: number[];
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
      
      // Validar datos antes de enviar
      if (turnoData.horaInicio && turnoData.horaFin) {
        if (turnoData.horaInicio >= turnoData.horaFin) {
          throw new Error('La hora de inicio debe ser anterior a la hora de fin');
        }
      }
      
      // Limpiar datos indefinidos o nulos
      const cleanData = Object.fromEntries(
        Object.entries(turnoData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      
      console.log(`Enviando petición PATCH a /turnos/${id} con datos:`, JSON.stringify(cleanData, null, 2));
      const response = await api.patch(`/turnos/${id}`, cleanData);
      console.log('Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar turno:', error);
      
      // Mostrar detalles más específicos del error
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        requestData: turnoData
      };
      
      console.error('Detalles del error:', errorDetails);
      
      // Crear un mensaje de error más descriptivo
      let errorMessage = 'Error al actualizar turno';
      
      if (error.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).details = errorDetails;
      throw enhancedError;
    }
  },

  // Eliminar un turno
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return turnosMockApi.delete(id);
    }
    await api.delete(`/turnos/${id}`);
  },

  // Asignar usuarios a un turno
  asignarUsuarios: async (turnoId: number, usuariosIds: number[]): Promise<void> => {
    if (USE_MOCK) {
      return;
    }
    await api.post(`/turnos/${turnoId}/usuarios`, { usuariosIds });
  },

  // Obtener usuarios asignados a un turno
  getUsuariosPorTurno: async (turnoId: number): Promise<Usuario[]> => {
    if (USE_MOCK) {
      return [];
    }
    const response = await api.get(`/turnos/${turnoId}/usuarios`);
    return response.data;
  },

  // Obtener turnos asignados a un usuario
  getTurnosPorUsuario: async (usuarioId: number): Promise<Turno[]> => {
    if (USE_MOCK) {
      return [];
    }
    const response = await api.get(`/turnos/usuario/${usuarioId}`);
    return response.data;
  },

  // Obtener el turno actual
  getTurnoActual: async (): Promise<Turno | null> => {
    if (USE_MOCK) {
      return null;
    }
    try {
      const response = await api.get('/turnos/actual');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Iniciar un turno (actualizar la hora de inicio con la hora actual)
  iniciarTurno: async (id: number): Promise<Turno> => {
    if (USE_MOCK) {
      return turnosMockApi.getById(id);
    }
    try {
      const response = await api.patch(`/turnos/${id}/iniciar`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error al iniciar turno:', error);
      throw new Error(error.response?.data?.message || 'Error al iniciar turno');
    }
  },

  // Finalizar un turno (actualizar la hora de fin con la hora actual)
  finalizarTurno: async (id: number): Promise<Turno> => {
    if (USE_MOCK) {
      return turnosMockApi.getById(id);
    }
    try {
      const response = await api.patch(`/turnos/${id}/finalizar`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error al finalizar turno:', error);
      throw new Error(error.response?.data?.message || 'Error al finalizar turno');
    }
  }
};

export default turnosApi;

import api from '../api';
import { isValidId, toValidId } from '../../utils/validationUtils';

export interface UsuarioTurno {
  id: number;
  usuarioId: number;
  turnoId: number;
  fechaAsignacion: Date;
  horaInicioReal: string | null;
  horaFinReal: string | null;
  activo: boolean;
  agente: boolean;
  super: boolean;
  usuario?: {
    id: number;
    nombre: string;
    apellido?: string;
    username: string;
  };
  turno?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

const usuariosTurnosApi = {
  // Obtener todas las asignaciones de usuarios a turnos
  getAll: async (): Promise<UsuarioTurno[]> => {
    try {
      console.log('[USUARIOS_TURNOS API] Obteniendo todas las asignaciones');
      const response = await api.get('/turnos/usuarios-turnos');
      return response.data;
    } catch (error: any) {
      console.error('[USUARIOS_TURNOS API] Error al obtener asignaciones:', error);
      throw new Error(`Error al obtener asignaciones: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener asignaciones por ID de usuario
  getByUsuarioId: async (usuarioId: number | string): Promise<UsuarioTurno[]> => {
    // Validar el ID de usuario
    const validUsuarioId = toValidId(usuarioId);
    
    if (validUsuarioId === undefined) {
      console.error(`[USUARIOS_TURNOS API] ID de usuario inválido: ${usuarioId}`);
      throw new Error(`ID de usuario inválido: ${usuarioId}`);
    }
    
    try {
      console.log(`[USUARIOS_TURNOS API] Obteniendo asignaciones para usuario ID: ${validUsuarioId}`);
      const response = await api.get(`/turnos/usuarios-turnos/usuario/${validUsuarioId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[USUARIOS_TURNOS API] Error al obtener asignaciones por usuario ID ${validUsuarioId}:`, error);
      
      // Si el error es 404, devolver array vacío en lugar de lanzar error
      if (error.response && error.response.status === 404) {
        console.log(`[USUARIOS_TURNOS API] No se encontraron asignaciones para el usuario ${validUsuarioId}`);
        return [];
      }
      
      throw new Error(`Error al obtener asignaciones: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener asignaciones por ID de turno
  getByTurnoId: async (turnoId: number | string): Promise<UsuarioTurno[]> => {
    // Validar el ID de turno
    const validTurnoId = toValidId(turnoId);
    
    if (validTurnoId === undefined) {
      console.error(`[USUARIOS_TURNOS API] ID de turno inválido: ${turnoId}`);
      throw new Error(`ID de turno inválido: ${turnoId}`);
    }
    
    try {
      console.log(`[USUARIOS_TURNOS API] Obteniendo asignaciones para turno ID: ${validTurnoId}`);
      const response = await api.get(`/turnos/usuarios-turnos/turno/${validTurnoId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[USUARIOS_TURNOS API] Error al obtener asignaciones por turno ID ${validTurnoId}:`, error);
      
      // Si el error es 404, devolver array vacío en lugar de lanzar error
      if (error.response && error.response.status === 404) {
        console.log(`[USUARIOS_TURNOS API] No se encontraron asignaciones para el turno ${validTurnoId}`);
        return [];
      }
      
      throw new Error(`Error al obtener asignaciones: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener turnos activos por ID de usuario
  getTurnosActivosPorUsuario: async (usuarioId: number | string): Promise<UsuarioTurno[]> => {
    // Validar el ID de usuario
    const validUsuarioId = toValidId(usuarioId);
    
    if (validUsuarioId === undefined) {
      console.error(`[USUARIOS_TURNOS API] ID de usuario inválido: ${usuarioId}`);
      throw new Error(`ID de usuario inválido: ${usuarioId}`);
    }
    
    try {
      console.log(`[USUARIOS_TURNOS API] Obteniendo turnos activos para usuario ID: ${validUsuarioId}`);
      const response = await api.get(`/turnos/usuario/${validUsuarioId}/turnos-activos`);
      return response.data;
    } catch (error: any) {
      console.error(`[USUARIOS_TURNOS API] Error al obtener turnos activos por usuario ID ${validUsuarioId}:`, error);
      
      // Si el error es 404, devolver array vacío en lugar de lanzar error
      if (error.response && error.response.status === 404) {
        console.log(`[USUARIOS_TURNOS API] No se encontraron turnos activos para el usuario ${validUsuarioId}`);
        return [];
      }
      
      throw new Error(`Error al obtener turnos activos: ${error.message || 'Error desconocido'}`);
    }
  },
  
  // Obtener todas las asignaciones de turnos de un usuario con detalles completos
  getAsignacionesConDetalles: async (usuarioId: number | string): Promise<UsuarioTurno[]> => {
    // Validar el ID de usuario
    const validUsuarioId = toValidId(usuarioId);
    
    if (validUsuarioId === undefined) {
      console.error(`[USUARIOS_TURNOS API] ID de usuario inválido: ${usuarioId}`);
      throw new Error(`ID de usuario inválido: ${usuarioId}`);
    }
    
    try {
      console.log(`[USUARIOS_TURNOS API] Obteniendo asignaciones con detalles para usuario ID: ${validUsuarioId}`);
      // Usar el endpoint que sí existe en el backend
      const response = await api.get(`/turnos/usuario/${validUsuarioId}/turnos-activos`);
      return response.data;
    } catch (error: any) {
      console.error(`[USUARIOS_TURNOS API] Error al obtener asignaciones con detalles por usuario ID ${validUsuarioId}:`, error);
      
      // Si el error es 404, devolver array vacío en lugar de lanzar error
      if (error.response && error.response.status === 404) {
        console.log(`[USUARIOS_TURNOS API] No se encontraron asignaciones para el usuario ${validUsuarioId}`);
        return [];
      }
      
      throw new Error(`Error al obtener asignaciones con detalles: ${error.message || 'Error desconocido'}`);
    }
  }
};

export default usuariosTurnosApi;

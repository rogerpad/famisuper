import api from '../api';
import turnosMockApi from './turnosMock';
import { isValidId, toValidId, isValidDate, validatePaginationParams } from '../../utils/validationUtils';

// Bandera para usar mock o API real
const USE_MOCK = false; // Usando la API real conectada a la base de datos

export interface Turno {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string | null;
  descripcion?: string;
  activo: boolean;
  usuarioId?: number;
  usuario?: Usuario;
  usuarios?: Usuario[];
  creadoEn?: Date;
  actualizadoEn?: Date;
  // Propiedades adicionales para datos reales de tbl_usuarios_turnos
  asignacionId?: number;
  usuarioTurnoId?: number;
  fechaAsignacion?: Date;
  agente?: boolean;
  super?: boolean;
}

export interface UsuarioTurno {
  id: number;
  usuarioId: number;
  turnoId: number;
  fechaAsignacion: Date;
  horaInicioReal: string | null;
  horaFinReal: string | null;
  activo: boolean;
  agente?: boolean;
  super?: boolean;
  cajaNumero?: number | null;
  usuario?: Usuario;
  turno?: Turno;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido?: string;
}

export interface RegistroActividad {
  id: number;
  turno: Turno;
  usuario: Usuario;
  accion: string;
  fechaHora: Date;
  descripcion?: string;
}

export interface RegistrosActividadResponse {
  registros: RegistroActividad[];
  total: number;
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
  getById: async (id: number | string): Promise<Turno> => {
    // Utilizar la función toValidId para validar el ID
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para getById: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.getById(validId);
    }
    
    try {
      console.log(`[TURNOS API] Obteniendo turno con ID validado: ${validId}`);
      const response = await api.get(`/turnos/${validId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al obtener turno por ID ${validId}:`, error);
      throw new Error(`Error al obtener turno: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener turnos por usuario_id
  getByUsuarioId: async (usuarioId: number | string): Promise<Turno[]> => {
    // Validar el ID de usuario
    const validUsuarioId = toValidId(usuarioId);
    
    if (validUsuarioId === undefined) {
      console.error(`[TURNOS API] ID de usuario inválido para getByUsuarioId: ${usuarioId}`);
      throw new Error(`ID de usuario inválido: ${usuarioId}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.getByUsuarioId(validUsuarioId);
    }
    
    try {
      console.log(`[TURNOS API] Obteniendo turnos para usuario con ID validado: ${validUsuarioId}`);
      const response = await api.get(`/turnos/usuario/${validUsuarioId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al obtener turnos por usuario ID ${validUsuarioId}:`, error);
      throw new Error(`Error al obtener turnos: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener turnos activos por usuario
  getTurnosActivosPorUsuario: async (usuarioId: number): Promise<UsuarioTurno[]> => {
    console.log(`[TURNOS_API] Obteniendo turnos activos para usuario ID: ${usuarioId}`);
    
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new Error(`ID de usuario inválido: ${usuarioId}`);
    }
    
    const response = await api.get(`/turnos/usuario/${usuarioId}/turnos-activos`);
    return response.data;
  },

  // Obtener operaciones en uso
  getOperacionesEnUso: async (): Promise<{
    operacionAgente: { enUso: boolean; usuario?: any };
    operacionSuper: { enUso: boolean; usuario?: any };
    cajas: Array<{ id: number; nombre: string; enUso: boolean; usuario?: any }>;
  }> => {
    console.log(`[TURNOS_API] Obteniendo estado de operaciones en uso`);
    const response = await api.get('/turnos/operaciones-en-uso');
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
  update: async (id: number | string, turnoData: UpdateTurnoDto): Promise<Turno> => {
    try {
      // Validar el ID del turno
      const validId = toValidId(id);
      
      if (validId === undefined) {
        console.error(`[TURNOS API] ID de turno inválido para update: ${id}`);
        throw new Error(`ID de turno inválido: ${id}`);
      }
      
      if (USE_MOCK) {
        return turnosMockApi.update(validId, turnoData);
      }
      
      // Validar datos antes de enviar
      if (turnoData.horaInicio && turnoData.horaFin) {
        if (turnoData.horaInicio >= turnoData.horaFin) {
          throw new Error('La hora de inicio debe ser anterior a la hora de fin');
        }
      }
      
      // Validar usuarioId si está presente
      if (turnoData.usuarioId !== undefined) {
        const validUsuarioId = toValidId(turnoData.usuarioId);
        if (validUsuarioId === undefined) {
          console.error(`[TURNOS API] ID de usuario inválido en update: ${turnoData.usuarioId}`);
          delete turnoData.usuarioId; // Eliminar el ID inválido
        } else {
          turnoData.usuarioId = validUsuarioId; // Usar el ID validado
        }
      }
      
      // Limpiar datos indefinidos o nulos
      const cleanData = Object.fromEntries(
        Object.entries(turnoData).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      
      console.log(`[TURNOS API] Enviando petición PATCH a /turnos/${validId} con datos:`, JSON.stringify(cleanData, null, 2));
      const response = await api.patch(`/turnos/${validId}`, cleanData);
      console.log('[TURNOS API] Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[TURNOS API] Error al actualizar turno:', error);
      
      // Mostrar detalles más específicos del error
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      
      console.error('[TURNOS API] Detalles del error:', errorDetails);
      
      // Lanzar un error con mensaje más informativo
      if (error.response?.data?.message) {
        throw new Error(`Error al actualizar turno: ${error.response.data.message}`);
      } else {
        throw new Error(`Error al actualizar turno: ${error.message}`);
      }
    }
  },

  // Eliminar un turno
  delete: async (id: number | string): Promise<void> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para delete: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.delete(validId);
    }
    
    try {
      console.log(`[TURNOS API] Eliminando turno con ID validado: ${validId}`);
      await api.delete(`/turnos/${validId}`);
    } catch (error: any) {
      console.error(`[TURNOS API] Error al eliminar turno ID ${validId}:`, error);
      throw new Error(`Error al eliminar turno: ${error.message || 'Error desconocido'}`);
    }
  },

  // Asignar usuarios a un turno
  asignarUsuarios: async (turnoId: number | string, usuariosIds: (number | string)[]): Promise<void> => {
    // Validar el ID del turno
    const validTurnoId = toValidId(turnoId);
    
    if (validTurnoId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para asignarUsuarios: ${turnoId}`);
      throw new Error(`ID de turno inválido: ${turnoId}`);
    }
    
    // Validar los IDs de usuarios
    const validUsuariosIds = usuariosIds
      .map(id => toValidId(id))
      .filter((id): id is number => id !== undefined);
    
    if (validUsuariosIds.length === 0 && usuariosIds.length > 0) {
      console.error(`[TURNOS API] Todos los IDs de usuarios son inválidos: ${usuariosIds.join(', ')}`);
      throw new Error(`IDs de usuarios inválidos`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.asignarUsuarios(validTurnoId, validUsuariosIds);
    }
    
    try {
      console.log(`[TURNOS API] Asignando usuarios ${validUsuariosIds.join(', ')} al turno ${validTurnoId}`);
      await api.post(`/turnos/${validTurnoId}/usuarios`, { usuariosIds: validUsuariosIds });
    } catch (error: any) {
      console.error(`[TURNOS API] Error al asignar usuarios al turno ID ${validTurnoId}:`, error);
      throw new Error(`Error al asignar usuarios: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener usuarios asignados a un turno
  getUsuariosPorTurno: async (turnoId: number | string): Promise<Usuario[]> => {
    // Validar el ID del turno
    const validTurnoId = toValidId(turnoId);
    
    if (validTurnoId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para getUsuariosPorTurno: ${turnoId}`);
      throw new Error(`ID de turno inválido: ${turnoId}`);
    }
    
    if (USE_MOCK) {
      return [];
    }
    
    try {
      console.log(`[TURNOS API] Obteniendo usuarios para el turno con ID validado: ${validTurnoId}`);
      const response = await api.get(`/turnos/${validTurnoId}/usuarios`);
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al obtener usuarios del turno ${validTurnoId}:`, error);
      
      // Si el error es 404, devolver array vacío en lugar de lanzar error
      if (error.response && error.response.status === 404) {
        console.log(`[TURNOS API] No se encontraron usuarios para el turno ${validTurnoId}`);
        return [];
      }
      
      // Para otros errores, lanzar excepción
      throw new Error(`Error al obtener usuarios del turno: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener turnos asignados a un usuario
  getTurnosPorUsuario: async (usuarioId: number | string): Promise<Turno[]> => {
    // Validar el ID del usuario
    const validUsuarioId = toValidId(usuarioId);
    
    if (validUsuarioId === undefined) {
      console.error(`[TURNOS API] ID de usuario inválido para getTurnosPorUsuario: ${usuarioId}`);
      throw new Error(`ID de usuario inválido: ${usuarioId}`);
    }
    
    if (USE_MOCK) {
      return [];
    }
    
    try {
      console.log(`[TURNOS API] Obteniendo turnos para el usuario con ID validado: ${validUsuarioId}`);
      const response = await api.get(`/turnos/usuario/${validUsuarioId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al obtener turnos del usuario ${validUsuarioId}:`, error);
      
      // Si el error es 404, devolver array vacío en lugar de lanzar error
      if (error.response && error.response.status === 404) {
        console.log(`[TURNOS API] No se encontraron turnos para el usuario ${validUsuarioId}`);
        return [];
      }
      
      // Para otros errores, lanzar excepción
      throw new Error(`Error al obtener turnos del usuario: ${error.message || 'Error desconocido'}`);
    }
  },

  // Obtener el turno actual
  getTurnoActual: async (): Promise<Turno | null> => {
    if (USE_MOCK) {
      return null;
    }
    try {
      console.log('[TURNOS API] Consultando turno actual');
      const response = await api.get('/turnos/actual');
      
      // Verificar si la respuesta es null o undefined
      if (!response.data) {
        console.log('[TURNOS API] No hay turno actual activo');
        return null;
      }
      
      // Verificar que el ID del turno sea un número válido usando isValidId
      if (!isValidId(response.data.id)) {
        console.error('[TURNOS API] Turno actual con ID inválido:', response.data);
        return null;
      }
      
      // Asegurarse de que el ID sea un número válido
      const validId = toValidId(response.data.id);
      if (validId !== undefined) {
        response.data.id = validId; // Asegurar que el ID sea un número válido
      }
      
      console.log('[TURNOS API] Turno actual obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[TURNOS API] Error al obtener turno actual:', error.message || error);
      return null;
    }
  },

  // Iniciar un turno (actualizar la hora de inicio con la hora actual)
  iniciarTurno: async (id: number | string): Promise<Turno> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para iniciarTurno: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.iniciarTurno(validId);
    }
    
    try {
      console.log(`[TURNOS API] Iniciando turno con ID validado: ${validId}`);
      const response = await api.patch(`/turnos/${validId}/iniciar`, {});
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al iniciar turno ID ${validId}:`, error);
      throw new Error(`Error al iniciar turno: ${error.message || 'Error desconocido'}`);
    }
  },

  // Finalizar un turno (actualizar la hora de fin con la hora actual)
  finalizarTurno: async (id: number | string): Promise<Turno> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para finalizarTurno: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.finalizarTurno(validId);
    }
    
    try {
      console.log(`[TURNOS API] Finalizando turno con ID validado: ${validId}`);
      const response = await api.patch(`/turnos/${validId}/finalizar`, {});
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al finalizar turno ID ${validId}:`, error);
      throw new Error(`Error al finalizar turno: ${error.message || 'Error desconocido'}`);
    }
  },

  // Iniciar un turno como vendedor (actualizar la hora de inicio con la hora actual)
  iniciarTurnoVendedor: async (
    id: number | string,
    operationType?: { agente: boolean; super: boolean; cajaNumero?: number }
  ): Promise<UsuarioTurno | Turno> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para iniciarTurnoVendedor: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.iniciarTurno(validId);
    }
    
    try {
      console.log(`[TURNOS API] Iniciando turno como vendedor con ID validado: ${validId}`);
      if (operationType) {
        console.log(`[TURNOS API] Tipo de operación: Agente=${operationType.agente}, Super=${operationType.super}, Caja=${operationType.cajaNumero || 'N/A'}`);
      }
      
      // Enviar los parámetros de tipo de operación si se proporcionan
      const response = await api.patch(`/turnos/${validId}/iniciar-vendedor`, operationType || {});
      
      // Verificar si el usuario tiene rol de vendedor
      // La respuesta puede ser un objeto UsuarioTurno o un objeto Turno dependiendo del rol
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al iniciar turno como vendedor ID ${validId}:`, error);
      
      // Verificar si el error es porque el usuario ya tiene un turno activo
      if (error.response?.data?.message?.includes('ya tiene un turno activo')) {
        throw new Error(`Ya tienes un turno activo. Debes finalizar el turno actual antes de iniciar uno nuevo.`);
      }
      
      // Verificar si el error es porque la caja está en uso
      if (error.response?.data?.message?.includes('ya está siendo utilizada')) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(`Error al iniciar turno como vendedor: ${error.message || 'Error desconocido'}`);
    }
  },
  
  // Verificar si el usuario tiene un turno activo
  verificarTurnoActivo: async (usuarioId: number | string): Promise<boolean> => {
    // Validar el ID del usuario
    const validId = toValidId(usuarioId);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de usuario inválido para verificarTurnoActivo: ${usuarioId}`);
      throw new Error(`ID de usuario inválido: ${usuarioId}`);
    }
    
    try {
      console.log(`[TURNOS API] Verificando si el usuario ${validId} tiene un turno activo`);
      const response = await api.get(`/turnos/usuario/${validId}/turnos-activos`);
      
      // Si hay al menos un turno activo, devolver true
      return Array.isArray(response.data) && response.data.length > 0;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al verificar turno activo para usuario ${validId}:`, error);
      return false; // En caso de error, asumir que no hay turno activo
    }
  },

  // Finalizar un turno Vendedor (solo actualizar la hora de fin sin desactivar tablas de operación)
  finalizarTurnoVendedor: async (id: number | string): Promise<UsuarioTurno | Turno> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para finalizarTurnoVendedor: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.finalizarTurno(validId);
    }
    
    try {
      console.log(`[TURNOS API] Finalizando turno Vendedor con ID validado: ${validId}`);
      const response = await api.patch(`/turnos/${validId}/finalizar-turno-vendedor`, {});
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al finalizar turno Vendedor ID ${validId}:`, error);
      throw new Error(`Error al finalizar turno Vendedor: ${error.message || 'Error desconocido'}`);
    }
  },

  // Finalizar un turno Super (actualizar la hora de fin con la hora actual y desactivar tablas de operación Super)
  finalizarTurnoSuper: async (id: number | string): Promise<UsuarioTurno | Turno> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para finalizarTurnoSuper: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.finalizarTurno(validId);
    }
    
    try {
      console.log(`[TURNOS API] Finalizando turno Super con ID validado: ${validId}`);
      const response = await api.patch(`/turnos/${validId}/finalizar-turno-super`, {});
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al finalizar turno Super ID ${validId}:`, error);
      throw new Error(`Error al finalizar turno Super: ${error.message || 'Error desconocido'}`);
    }
  },

  // Finalizar un turno Agente (actualizar la hora de fin con la hora actual y desactivar tablas de operación Agente)
  finalizarTurnoAgente: async (id: number | string): Promise<UsuarioTurno | Turno> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para finalizarTurnoAgente: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.finalizarTurno(validId);
    }
    
    try {
      console.log(`[TURNOS API] Finalizando turno Agente con ID validado: ${validId}`);
      const response = await api.patch(`/turnos/${validId}/finalizar-turno-agente`, {});
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al finalizar turno Agente ID ${validId}:`, error);
      throw new Error(`Error al finalizar turno Agente: ${error.message || 'Error desconocido'}`);
    }
  },

  // Reiniciar un turno (eliminar hora de inicio y fin)
  reiniciarTurno: async (id: number | string): Promise<UsuarioTurno | Turno> => {
    // Validar el ID del turno
    const validId = toValidId(id);
    
    if (validId === undefined) {
      console.error(`[TURNOS API] ID de turno inválido para reiniciarTurno: ${id}`);
      throw new Error(`ID de turno inválido: ${id}`);
    }
    
    if (USE_MOCK) {
      return turnosMockApi.getById(validId);
    }
    
    try {
      console.log(`[TURNOS API] Reiniciando turno con ID validado: ${validId}`);
      const response = await api.patch(`/turnos/${validId}/reiniciar`, {});
      return response.data;
    } catch (error: any) {
      console.error(`[TURNOS API] Error al reiniciar turno ID ${validId}:`, error);
      throw new Error(`Error al reiniciar turno: ${error.message || 'Error desconocido'}`);
    }
  },
  
  // Verificar y crear registros de actividad de prueba si no existen
  verificarRegistrosActividad: async (): Promise<{ success: boolean; message: string; count: number }> => {
    if (USE_MOCK) {
      return { success: true, message: 'Modo mock: No se verificaron registros', count: 0 };
    }

    try {
      console.log('[TURNOS API] Verificando registros de actividad...');
      const response = await api.get('/turnos/verificar-registros-actividad');
      console.log('[TURNOS API] Respuesta de verificación:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[TURNOS API] Error al verificar registros de actividad:', error);
      throw new Error(`Error al verificar registros de actividad: ${error.message || 'Error desconocido'}`);
    }
  },
  
  // Obtener registros de actividad de turnos con filtros opcionales
  getRegistrosActividad: async (options?: {
    turnoId?: number | string;
    usuarioId?: number | string;
    fechaInicio?: Date;
    fechaFin?: Date;
    limit?: number;
    offset?: number;
  }): Promise<RegistrosActividadResponse> => {
    // Crear un objeto para almacenar las opciones validadas
    const validatedOptions: {
      turnoId?: number;
      usuarioId?: number;
      fechaInicio?: Date;
      fechaFin?: Date;
      limit: number;
      offset: number;
    } = {
      limit: 10,
      offset: 0
    };
    
    // Si no hay opciones, usar valores predeterminados
    if (!options) {
      console.log('[TURNOS API] No se proporcionaron opciones para getRegistrosActividad, usando valores predeterminados');
      options = {};
    }
    
    // Validar IDs si se proporcionan
    if (options?.turnoId !== undefined) {
      const validTurnoId = toValidId(options.turnoId);
      if (validTurnoId !== undefined) {
        validatedOptions.turnoId = validTurnoId;
        console.log(`[TURNOS API] ID de turno válido: ${validTurnoId}`);
      } else {
        console.error(`[TURNOS API] ID de turno inválido:`, options.turnoId);
      }
    }
    
    if (options?.usuarioId !== undefined) {
      const validUsuarioId = toValidId(options.usuarioId);
      if (validUsuarioId !== undefined) {
        validatedOptions.usuarioId = validUsuarioId;
        console.log(`[TURNOS API] ID de usuario válido: ${validUsuarioId}`);
      } else {
        console.error(`[TURNOS API] ID de usuario inválido:`, options.usuarioId);
      }
    }
    
    // Validar fechas si se proporcionan
    if (options?.fechaInicio && isValidDate(options.fechaInicio)) {
      validatedOptions.fechaInicio = options.fechaInicio;
      console.log(`[TURNOS API] Fecha inicio válida: ${options.fechaInicio}`);
    } else if (options?.fechaInicio) {
      console.error(`[TURNOS API] Fecha inicio inválida:`, options.fechaInicio);
    }
    
    if (options?.fechaFin && isValidDate(options.fechaFin)) {
      validatedOptions.fechaFin = options.fechaFin;
      console.log(`[TURNOS API] Fecha fin válida: ${options.fechaFin}`);
    } else if (options?.fechaFin) {
      console.error(`[TURNOS API] Fecha fin inválida:`, options.fechaFin);
    }
    
    // Validar parámetros de paginación
    const { limit, offset } = validatePaginationParams(options?.limit, options?.offset);
    validatedOptions.limit = limit;
    validatedOptions.offset = offset;
    
    console.log(`[TURNOS API] Opciones validadas:`, validatedOptions);
    
    // Construir parámetros de consulta para la URL
    const params: Record<string, string> = {};
    
    // Añadir IDs validados a los parámetros
    if (validatedOptions.turnoId !== undefined) {
      params.turnoId = validatedOptions.turnoId.toString();
    }
    
    if (validatedOptions.usuarioId !== undefined) {
      params.usuarioId = validatedOptions.usuarioId.toString();
    }
    
    // Añadir fechas validadas a los parámetros con validación adicional para evitar errores de serialización
    if (validatedOptions.fechaInicio) {
      try {
        // Verificar que la fecha es válida antes de serializar
        if (validatedOptions.fechaInicio instanceof Date && !isNaN(validatedOptions.fechaInicio.getTime())) {
          params.fechaInicio = validatedOptions.fechaInicio.toISOString();
          console.log(`[TURNOS API] Fecha inicio serializada correctamente: ${params.fechaInicio}`);
        } else {
          console.error(`[TURNOS API] Fecha inicio no válida para serialización:`, validatedOptions.fechaInicio);
        }
      } catch (error) {
        console.error(`[TURNOS API] Error al serializar fecha inicio:`, error);
      }
    }
    
    if (validatedOptions.fechaFin) {
      try {
        // Verificar que la fecha es válida antes de serializar
        if (validatedOptions.fechaFin instanceof Date && !isNaN(validatedOptions.fechaFin.getTime())) {
          params.fechaFin = validatedOptions.fechaFin.toISOString();
          console.log(`[TURNOS API] Fecha fin serializada correctamente: ${params.fechaFin}`);
        } else {
          console.error(`[TURNOS API] Fecha fin no válida para serialización:`, validatedOptions.fechaFin);
        }
      } catch (error) {
        console.error(`[TURNOS API] Error al serializar fecha fin:`, error);
      }
    }
    
    // Añadir parámetros de paginación validados
    params.limit = validatedOptions.limit.toString();
    params.offset = validatedOptions.offset.toString();
    
    console.log(`[TURNOS API] Consultando registros de actividad con parámetros:`, params);
    
    try {
      const response = await api.get('/turnos/registros-actividad', { params });
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data || typeof response.data !== 'object') {
        console.error('[TURNOS API] Respuesta inválida al obtener registros de actividad:', response.data);
        return { registros: [], total: 0 };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[TURNOS API] Error al obtener registros de actividad:', error);
      // En lugar de lanzar un error, devolvemos un objeto vacío para evitar que la UI se rompa
      return { registros: [], total: 0 };
    }
  }
};

export default turnosApi;

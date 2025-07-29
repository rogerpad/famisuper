import axios from 'axios';
import { API_BASE_URL } from '../api';
import { isValidId, toValidId, toValidIdOrNull } from '../../utils/idValidation';

// Interfaces para el manejo de denominaciones y conteo de efectivo
export interface Denomination {
  value: number;
  label: string;
  quantity: number;
  total: number;
}

export interface CashCount {
  denominations: Denomination[];
  totalCash: number;
  turnoId?: number;
}

// Nueva interfaz para el conteo de billetes con la estructura actualizada
export interface CashCountData {
  usuarioId: number;
  totalGeneral: number;
  estado?: boolean;
  // NOTA: La columna turno_id ahora está disponible en la base de datos
  turnoId?: number;
  deno500?: number;
  cant500?: number;
  total500?: number;
  deno200?: number;
  cant200?: number;
  total200?: number;
  deno100?: number;
  cant100?: number;
  total100?: number;
  deno50?: number;
  cant50?: number;
  total50?: number;
  deno20?: number;
  cant20?: number;
  total20?: number;
  deno10?: number;
  cant10?: number;
  total10?: number;
  deno5?: number;
  cant5?: number;
  total5?: number;
  deno2?: number;
  cant2?: number;
  total2?: number;
  deno1?: number;
  cant1?: number;
  total1?: number;
}

// Interfaz que representa la tabla tbl_conteo_billetes en la base de datos
export interface Billete {
  id: number;
  usuarioId: number;    // ID del usuario que realizó el conteo
  // Campos antiguos (para compatibilidad con código existente)
  billete?: number;     // Denominación del billete
  cantidad?: number;    // Cantidad de billetes
  totalBillete?: number; // Valor total de esta denominación (billete * cantidad)
  total?: number;       // Total general del conteo (suma de todos los totalBillete)
  // Campos nuevos según la entidad del backend
  totalGeneral: number; // Total general del conteo
  estado: boolean;      // Estado del registro
  activo: boolean;      // Estado del registro
  fecha: Date | string;  // Fecha del conteo (puede venir como Date o string)
  fechaRegistro: string | Date; // Fecha de registro (puede venir como string o Date)
  turnoId: number | null; // ID del turno asociado, puede ser nulo
  // Denominaciones
  deno500?: number;
  cant500?: number;
  total500?: number;
  deno200?: number;
  cant200?: number;
  total200?: number;
  deno100?: number;
  cant100?: number;
  total100?: number;
  deno50?: number;
  cant50?: number;
  total50?: number;
  deno20?: number;
  cant20?: number;
  total20?: number;
  deno10?: number;
  cant10?: number;
  total10?: number;
  deno5?: number;
  cant5?: number;
  total5?: number;
  deno2?: number;
  cant2?: number;
  total2?: number;
  deno1?: number;
  cant1?: number;
  total1?: number;
}

const cashApi = {
  /**
   * Guarda un conteo de efectivo en la base de datos con la nueva estructura
   * @param cashCountData Objeto con los datos del conteo de efectivo en el nuevo formato
   * @returns Billete guardado en la base de datos
   */
  saveCashCount: async (cashCountData: CashCountData): Promise<Billete> => {
    try {
      // Validar que el objeto cashCountData sea válido
      if (!cashCountData || typeof cashCountData !== 'object') {
        throw new Error('Datos de conteo inválidos');
      }
      
      // Validar que el usuarioId sea un número válido
      if (!isValidId(cashCountData.usuarioId)) {
        throw new Error(`ID de usuario inválido: ${cashCountData.usuarioId}`);
      }
      
      // Validar que el total general sea un número válido
      if (cashCountData.totalGeneral === undefined || cashCountData.totalGeneral === null || 
          isNaN(Number(cashCountData.totalGeneral)) || Number(cashCountData.totalGeneral) < 0) {
        console.error(`[CASH_API] Total general inválido: ${cashCountData.totalGeneral}`);
        throw new Error(`Total general inválido: ${cashCountData.totalGeneral}`);
      }
      
      // Validar el turnoId si está presente
      if (cashCountData.turnoId !== undefined && !isValidId(cashCountData.turnoId)) {
        console.error(`[CASH_API] ID de turno inválido: ${cashCountData.turnoId}`);
        throw new Error(`ID de turno inválido: ${cashCountData.turnoId}`);
      }
      
      // Crear una copia del objeto original para no modificarlo
      const cashCountDataCopy = { ...cashCountData };
      
      // SIEMPRE eliminar explícitamente el campo turnoId para evitar el error "property turnoId should not exist"
      // Solo lo añadiremos de vuelta si es absolutamente necesario y válido
      delete cashCountDataCopy.turnoId;
      console.log('[CASH_API] Campo turnoId eliminado para evitar errores de validación');
      
      // Crear un objeto base sin el campo turnoId
      const validatedCashCountData = {
        usuarioId: toValidId(cashCountDataCopy.usuarioId),
        totalGeneral: Number(cashCountDataCopy.totalGeneral),
        estado: cashCountDataCopy.estado,
        
        // Convertir todos los campos numéricos a números
        deno500: cashCountDataCopy.deno500 !== undefined ? Number(cashCountDataCopy.deno500) : undefined,
        cant500: cashCountDataCopy.cant500 !== undefined ? Number(cashCountDataCopy.cant500) : undefined,
        total500: cashCountDataCopy.total500 !== undefined ? Number(cashCountDataCopy.total500) : undefined,
        
        deno200: cashCountDataCopy.deno200 !== undefined ? Number(cashCountDataCopy.deno200) : undefined,
        cant200: cashCountDataCopy.cant200 !== undefined ? Number(cashCountDataCopy.cant200) : undefined,
        total200: cashCountDataCopy.total200 !== undefined ? Number(cashCountDataCopy.total200) : undefined,
        
        deno100: cashCountDataCopy.deno100 !== undefined ? Number(cashCountDataCopy.deno100) : undefined,
        cant100: cashCountDataCopy.cant100 !== undefined ? Number(cashCountDataCopy.cant100) : undefined,
        total100: cashCountDataCopy.total100 !== undefined ? Number(cashCountDataCopy.total100) : undefined,
        
        deno50: cashCountDataCopy.deno50 !== undefined ? Number(cashCountDataCopy.deno50) : undefined,
        cant50: cashCountDataCopy.cant50 !== undefined ? Number(cashCountDataCopy.cant50) : undefined,
        total50: cashCountDataCopy.total50 !== undefined ? Number(cashCountDataCopy.total50) : undefined,
        
        deno20: cashCountDataCopy.deno20 !== undefined ? Number(cashCountDataCopy.deno20) : undefined,
        cant20: cashCountDataCopy.cant20 !== undefined ? Number(cashCountDataCopy.cant20) : undefined,
        total20: cashCountDataCopy.total20 !== undefined ? Number(cashCountDataCopy.total20) : undefined,
        
        deno10: cashCountDataCopy.deno10 !== undefined ? Number(cashCountDataCopy.deno10) : undefined,
        cant10: cashCountDataCopy.cant10 !== undefined ? Number(cashCountDataCopy.cant10) : undefined,
        total10: cashCountDataCopy.total10 !== undefined ? Number(cashCountDataCopy.total10) : undefined,
        
        deno5: cashCountDataCopy.deno5 !== undefined ? Number(cashCountDataCopy.deno5) : undefined,
        cant5: cashCountDataCopy.cant5 !== undefined ? Number(cashCountDataCopy.cant5) : undefined,
        total5: cashCountDataCopy.total5 !== undefined ? Number(cashCountDataCopy.total5) : undefined,
        
        deno2: cashCountDataCopy.deno2 !== undefined ? Number(cashCountDataCopy.deno2) : undefined,
        cant2: cashCountDataCopy.cant2 !== undefined ? Number(cashCountDataCopy.cant2) : undefined,
        total2: cashCountDataCopy.total2 !== undefined ? Number(cashCountDataCopy.total2) : undefined,
        
        deno1: cashCountDataCopy.deno1 !== undefined ? Number(cashCountDataCopy.deno1) : undefined,
        cant1: cashCountDataCopy.cant1 !== undefined ? Number(cashCountDataCopy.cant1) : undefined,
        total1: cashCountDataCopy.total1 !== undefined ? Number(cashCountDataCopy.total1) : undefined
      };
      
      console.log(`[CASH_API] Guardando conteo para usuario ID: ${validatedCashCountData.usuarioId}`);
      console.log(`[CASH_API] Datos validados:`, validatedCashCountData);
      
      const response = await axios.post(`${API_BASE_URL}/billetes/cash-count`, validatedCashCountData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.data) {
        console.warn('[CASH_API] La respuesta no contiene un registro válido:', response.data);
        throw new Error('La respuesta del servidor no contiene un registro válido');
      }
      
      console.log(`[CASH_API] Guardado registro con ID: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      console.error('[CASH_API] Error al guardar conteo de efectivo:', error);
      
      // Mejorar el mensaje de error para depuración
      if (error.response) {
        console.error(`[CASH_API] Status: ${error.response.status}, Mensaje: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  },
  
  /**
   * Obtiene todos los billetes
   * @returns Array de billetes
   */
  getAllBilletes: async (): Promise<Billete[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/billetes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los billetes:', error);
      throw error;
    }
  },

  /**
   * Obtiene los billetes asociados a un turno específico
   * @param turnoId ID del turno
   * @returns Array de billetes del turno
   */
  getBilletesByTurno: async (turnoId: number): Promise<Billete[]> => {
    try {
      // Validar que el turnoId sea un número válido usando la utilidad
      if (!isValidId(turnoId)) {
        console.error(`[CASH_API] ID de turno inválido: ${turnoId}`);
        return [];
      }
      
      const validTurnoId = toValidId(turnoId);
      console.log(`[CASH_API] Obteniendo billetes para turnoId: ${turnoId} => ${validTurnoId}`);
      
      const response = await axios.get(`${API_BASE_URL}/billetes/turno/${validTurnoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`[CASH_API] Error al obtener billetes del turno ${turnoId}:`, error);
      return [];
    }
  },

  /**
   * Actualiza un conteo de efectivo existente
   * @param id ID del conteo a actualizar
   * @param cashCountData Objeto con los datos actualizados del conteo
   * @returns Billete actualizado
   */
  updateCashCount: async (id: number, cashCountData: CashCountData): Promise<Billete> => {
    try {
      // Validar que el ID sea un número válido
      if (!isValidId(id)) {
        throw new Error(`ID de conteo inválido: ${id}`);
      }
      
      // Validar que el objeto cashCountData sea válido
      if (!cashCountData || typeof cashCountData !== 'object') {
        throw new Error('Datos de conteo inválidos');
      }
      
      // Validar que el usuarioId sea un número válido
      if (!isValidId(cashCountData.usuarioId)) {
        throw new Error(`ID de usuario inválido: ${cashCountData.usuarioId}`);
      }
      
      // Validar que el total general sea un número válido
      if (cashCountData.totalGeneral === undefined || cashCountData.totalGeneral === null || 
          isNaN(Number(cashCountData.totalGeneral)) || Number(cashCountData.totalGeneral) < 0) {
        console.error(`[CASH_API] Total general inválido: ${cashCountData.totalGeneral}`);
        throw new Error(`Total general inválido: ${cashCountData.totalGeneral}`);
      }
      
      // Crear una copia del objeto original para no modificarlo
      const cashCountDataCopy = { ...cashCountData };
      
      // SIEMPRE eliminar explícitamente el campo turnoId para evitar el error "property turnoId should not exist"
      // Solo lo añadiremos de vuelta si es absolutamente necesario y válido
      delete cashCountDataCopy.turnoId;
      console.log('[CASH_API] Campo turnoId eliminado para evitar errores de validación');
      
      // Crear un objeto base sin el campo turnoId
      const validatedCashCountData = {
        usuarioId: toValidId(cashCountDataCopy.usuarioId),
        totalGeneral: Number(cashCountDataCopy.totalGeneral),
        estado: cashCountDataCopy.estado,
        
        // Denominaciones
        deno500: cashCountDataCopy.deno500 !== undefined ? Number(cashCountDataCopy.deno500) : undefined,
        cant500: cashCountDataCopy.cant500 !== undefined ? Number(cashCountDataCopy.cant500) : undefined,
        total500: cashCountDataCopy.total500 !== undefined ? Number(cashCountDataCopy.total500) : undefined,
        
        deno200: cashCountDataCopy.deno200 !== undefined ? Number(cashCountDataCopy.deno200) : undefined,
        cant200: cashCountDataCopy.cant200 !== undefined ? Number(cashCountDataCopy.cant200) : undefined,
        total200: cashCountDataCopy.total200 !== undefined ? Number(cashCountDataCopy.total200) : undefined,
        
        deno100: cashCountDataCopy.deno100 !== undefined ? Number(cashCountDataCopy.deno100) : undefined,
        cant100: cashCountDataCopy.cant100 !== undefined ? Number(cashCountDataCopy.cant100) : undefined,
        total100: cashCountDataCopy.total100 !== undefined ? Number(cashCountDataCopy.total100) : undefined,
        
        deno50: cashCountDataCopy.deno50 !== undefined ? Number(cashCountDataCopy.deno50) : undefined,
        cant50: cashCountDataCopy.cant50 !== undefined ? Number(cashCountDataCopy.cant50) : undefined,
        total50: cashCountDataCopy.total50 !== undefined ? Number(cashCountDataCopy.total50) : undefined,
        
        deno20: cashCountDataCopy.deno20 !== undefined ? Number(cashCountDataCopy.deno20) : undefined,
        cant20: cashCountDataCopy.cant20 !== undefined ? Number(cashCountDataCopy.cant20) : undefined,
        total20: cashCountDataCopy.total20 !== undefined ? Number(cashCountDataCopy.total20) : undefined,
        
        deno10: cashCountDataCopy.deno10 !== undefined ? Number(cashCountDataCopy.deno10) : undefined,
        cant10: cashCountDataCopy.cant10 !== undefined ? Number(cashCountDataCopy.cant10) : undefined,
        total10: cashCountDataCopy.total10 !== undefined ? Number(cashCountDataCopy.total10) : undefined,
        
        deno5: cashCountDataCopy.deno5 !== undefined ? Number(cashCountDataCopy.deno5) : undefined,
        cant5: cashCountDataCopy.cant5 !== undefined ? Number(cashCountDataCopy.cant5) : undefined,
        total5: cashCountDataCopy.total5 !== undefined ? Number(cashCountDataCopy.total5) : undefined,
        
        deno2: cashCountDataCopy.deno2 !== undefined ? Number(cashCountDataCopy.deno2) : undefined,
        cant2: cashCountDataCopy.cant2 !== undefined ? Number(cashCountDataCopy.cant2) : undefined,
        total2: cashCountDataCopy.total2 !== undefined ? Number(cashCountDataCopy.total2) : undefined,
        
        deno1: cashCountDataCopy.deno1 !== undefined ? Number(cashCountDataCopy.deno1) : undefined,
        cant1: cashCountDataCopy.cant1 !== undefined ? Number(cashCountDataCopy.cant1) : undefined,
        total1: cashCountDataCopy.total1 !== undefined ? Number(cashCountDataCopy.total1) : undefined
      };
      
      console.log(`[CASH_API] Actualizando conteo ID: ${id} para usuario ID: ${validatedCashCountData.usuarioId}`);
      console.log(`[CASH_API] Datos validados:`, validatedCashCountData);
      
      const response = await axios.put(`${API_BASE_URL}/billetes/${id}`, validatedCashCountData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.data) {
        console.warn('[CASH_API] La respuesta no contiene un registro válido:', response.data);
        throw new Error('La respuesta del servidor no contiene un registro válido');
      }
      
      console.log(`[CASH_API] Actualizado registro con ID: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      console.error('[CASH_API] Error al actualizar conteo de efectivo:', error);
      
      // Mejorar el mensaje de error para depuración
      if (error.response) {
        console.error(`[CASH_API] Status: ${error.response.status}, Mensaje: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  },

  // La función getLatestCashCount ha sido eliminada ya que no se utiliza
  // después de quitar el botón "Cargar desde BD" del componente CashCounter

  /**
   * Elimina un conteo de efectivo por su ID
   * @param id ID del conteo a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  deleteCashCount: async (id: number): Promise<boolean> => {
    try {
      // Validar que el ID sea un número válido
      if (!isValidId(id)) {
        console.error(`[CASH_API] ID de conteo inválido: ${id}`);
        throw new Error(`ID de conteo inválido: ${id}`);
      }
      
      const validId = toValidId(id);
      console.log(`[CASH_API] Eliminando conteo con ID: ${validId}`);
      
      const response = await axios.delete(`${API_BASE_URL}/billetes/${validId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log(`[CASH_API] Conteo eliminado correctamente: ${validId}`);
      return true;
    } catch (error: any) {
      console.error(`[CASH_API] Error al eliminar conteo de efectivo con ID ${id}:`, error);
      
      // Mejorar el mensaje de error para depuración
      if (error.response) {
        console.error(`[CASH_API] Status: ${error.response.status}, Mensaje: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  }
};

export default cashApi;

import api from '../api';
import { API_BASE_URL } from '../config';

export interface AdicionalesPrestamosData {
  id?: number;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    username: string;
  };
  acuerdo: string;
  origen: string;
  monto: number;
  descripcion: string;
  fecha?: Date | string;
  activo: boolean;
}

export interface AdicionalesPrestamosFormData {
  usuarioId: number;
  acuerdo: string;
  origen: string;
  monto: number;
  descripcion: string;
  activo?: boolean;
}

// Función para convertir valores numéricos de forma segura
export const safeParseFloat = (value: any): number => {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Función para asegurar que un valor sea un número válido
export const ensureNumber = (value: any): number => {
  return safeParseFloat(value);
};

// Función para normalizar los datos recibidos del backend
const normalizeAdicionalesPrestamosData = (data: any): AdicionalesPrestamosData => {
  return {
    id: data.id,
    usuarioId: data.usuarioId,
    usuario: data.usuario,
    acuerdo: data.acuerdo || '',
    origen: data.origen || '',
    monto: ensureNumber(data.monto),
    descripcion: data.descripcion || '',
    fecha: data.fecha,
    activo: data.activo !== undefined ? data.activo : true
  };
};

// Obtener todos los adicionales/préstamos
export const getAdicionalesPrestamos = async (activo?: boolean): Promise<AdicionalesPrestamosData[]> => {
  try {
    let url = `${API_BASE_URL}/adicionales-prestamos`;
    if (activo !== undefined) {
      url += `?activo=${activo}`;
    }
    
    const response = await api.get(url);
    return response.data.map(normalizeAdicionalesPrestamosData);
  } catch (error) {
    console.error('[ADICIONALES_PRESTAMOS_API] Error al obtener adicionales/préstamos:', error);
    throw error;
  }
};

// Obtener un adicional/préstamo por ID
export const getAdicionalesPrestamosById = async (id: number): Promise<AdicionalesPrestamosData> => {
  try {
    const response = await api.get(`${API_BASE_URL}/adicionales-prestamos/${id}`);
    return normalizeAdicionalesPrestamosData(response.data);
  } catch (error) {
    console.error(`[ADICIONALES_PRESTAMOS_API] Error al obtener adicional/préstamo con ID ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo adicional/préstamo
export const createAdicionalesPrestamos = async (data: AdicionalesPrestamosFormData): Promise<AdicionalesPrestamosData> => {
  try {
    const response = await api.post(`${API_BASE_URL}/adicionales-prestamos`, data);
    return normalizeAdicionalesPrestamosData(response.data);
  } catch (error) {
    console.error('[ADICIONALES_PRESTAMOS_API] Error al crear adicional/préstamo:', error);
    throw error;
  }
};

// Actualizar un adicional/préstamo existente
export const updateAdicionalesPrestamos = async (id: number, data: Partial<AdicionalesPrestamosFormData>): Promise<AdicionalesPrestamosData> => {
  try {
    const response = await api.patch(`${API_BASE_URL}/adicionales-prestamos/${id}`, data);
    return normalizeAdicionalesPrestamosData(response.data);
  } catch (error) {
    console.error(`[ADICIONALES_PRESTAMOS_API] Error al actualizar adicional/préstamo con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un adicional/préstamo
export const deleteAdicionalesPrestamos = async (id: number): Promise<void> => {
  try {
    await api.delete(`${API_BASE_URL}/adicionales-prestamos/${id}`);
  } catch (error) {
    console.error(`[ADICIONALES_PRESTAMOS_API] Error al eliminar adicional/préstamo con ID ${id}:`, error);
    throw error;
  }
};

// Obtener adicionales y préstamos activos por acuerdo y origen
export const getAdicionalesPrestamosActivosByAcuerdoOrigen = async (acuerdo: string, origen: string): Promise<AdicionalesPrestamosData[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/adicionales-prestamos?acuerdo=${acuerdo}&origen=${origen}&activo=true`);
    return response.data.map(normalizeAdicionalesPrestamosData);
  } catch (error) {
    console.error(`[ADICIONALES_PRESTAMOS_API] Error al obtener adicionales/préstamos activos con acuerdo ${acuerdo} y origen ${origen}:`, error);
    return [];
  }
};

// Obtener el monto total de adicionales o préstamos activos por acuerdo y origen
export const getMontoTotalByAcuerdoOrigen = async (acuerdo: string, origen: string): Promise<number> => {
  try {
    const items = await getAdicionalesPrestamosActivosByAcuerdoOrigen(acuerdo, origen);
    return items.reduce((total, item) => total + ensureNumber(item.monto), 0);
  } catch (error) {
    console.error(`[ADICIONALES_PRESTAMOS_API] Error al calcular monto total para acuerdo ${acuerdo} y origen ${origen}:`, error);
    return 0;
  }
};

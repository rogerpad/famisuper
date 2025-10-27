import api from '../api';
import { API_BASE_URL } from '../config';

export interface AdditionalLoanData {
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
  cajaNumero?: number | null;
}

export interface AdditionalLoanFormData {
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
const normalizeAdditionalLoanData = (data: any): AdditionalLoanData => {
  return {
    id: data.id,
    usuarioId: data.usuarioId,
    usuario: data.usuario,
    acuerdo: data.acuerdo || '',
    origen: data.origen || '',
    monto: ensureNumber(data.monto),
    descripcion: data.descripcion || '',
    fecha: data.fecha,
    activo: data.activo !== undefined ? data.activo : true,
    cajaNumero: data.cajaNumero
  };
};

// Obtener todos los adicionales/préstamos
export const getAdditionalLoans = async (activo?: boolean): Promise<AdditionalLoanData[]> => {
  try {
    let url = `${API_BASE_URL}/adicionales-prestamos`;
    if (activo !== undefined) {
      url += `?activo=${activo}`;
    }
    
    const response = await api.get(url);
    return response.data.map(normalizeAdditionalLoanData);
  } catch (error) {
    console.error('[ADDITIONAL_LOAN_API] Error loading additional loans:', error);
    throw error;
  }
};

// Obtener un adicional/préstamo por ID
export const getAdditionalLoanById = async (id: number): Promise<AdditionalLoanData> => {
  try {
    const response = await api.get(`${API_BASE_URL}/adicionales-prestamos/${id}`);
    return normalizeAdditionalLoanData(response.data);
  } catch (error) {
    console.error(`[ADDITIONAL_LOAN_API] Error loading additional loan with ID ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo adicional/préstamo
export const createAdditionalLoan = async (data: AdditionalLoanFormData): Promise<AdditionalLoanData> => {
  try {
    const response = await api.post(`${API_BASE_URL}/adicionales-prestamos`, data);
    return normalizeAdditionalLoanData(response.data);
  } catch (error) {
    console.error('[ADDITIONAL_LOAN_API] Error creating additional loan:', error);
    throw error;
  }
};

// Actualizar un adicional/préstamo existente
export const updateAdditionalLoan = async (id: number, data: Partial<AdditionalLoanFormData>): Promise<AdditionalLoanData> => {
  try {
    const response = await api.patch(`${API_BASE_URL}/adicionales-prestamos/${id}`, data);
    return normalizeAdditionalLoanData(response.data);
  } catch (error) {
    console.error(`[ADDITIONAL_LOAN_API] Error updating additional loan with ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un adicional/préstamo
export const deleteAdditionalLoan = async (id: number): Promise<void> => {
  try {
    await api.delete(`${API_BASE_URL}/adicionales-prestamos/${id}`);
  } catch (error) {
    console.error(`[ADDITIONAL_LOAN_API] Error deleting additional loan with ID ${id}:`, error);
    throw error;
  }
};

// Obtener adicionales y préstamos activos por acuerdo y origen
export const getActiveAdditionalLoansByAcuerdoOrigen = async (acuerdo: string, origen: string): Promise<AdditionalLoanData[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/adicionales-prestamos?acuerdo=${acuerdo}&origen=${origen}&activo=true`);
    return response.data.map(normalizeAdditionalLoanData);
  } catch (error) {
    console.error(`[ADDITIONAL_LOAN_API] Error loading active loans with acuerdo ${acuerdo} and origen ${origen}:`, error);
    return [];
  }
};

// Obtener el monto total de adicionales o préstamos activos por acuerdo y origen
export const getTotalAmountByAcuerdoOrigen = async (acuerdo: string, origen: string): Promise<number> => {
  try {
    const items = await getActiveAdditionalLoansByAcuerdoOrigen(acuerdo, origen);
    return items.reduce((total, item) => total + ensureNumber(item.monto), 0);
  } catch (error) {
    console.error(`[ADDITIONAL_LOAN_API] Error calculating total amount for acuerdo ${acuerdo} and origen ${origen}:`, error);
    return 0;
  }
};

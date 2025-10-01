/**
 * Utilidades para validación de datos en la aplicación
 */

/**
 * Valida si un valor puede convertirse a un ID numérico válido
 * @param value Valor a validar (string, number o undefined)
 * @returns true si es un ID válido, false en caso contrario
 */
export const isValidId = (value: any): boolean => {
  // Si es undefined, null o cadena vacía
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return false;
  }
  
  // Si es string, verificar que solo contiene dígitos
  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) {
    return false;
  }
  
  // Convertir a número
  const numValue = Number(value);
  
  // Verificar que es un número válido, entero y positivo
  return !isNaN(numValue) && Number.isInteger(numValue) && numValue > 0;
};

/**
 * Convierte un valor a un ID numérico válido
 * @param value Valor a convertir (string, number o undefined)
 * @param defaultValue Valor por defecto si la conversión falla (por defecto 0)
 * @returns El ID numérico válido o el valor por defecto
 */
export const toValidId = (value: any, defaultValue: number = 0): number => {
  // Si es undefined, null o cadena vacía
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return defaultValue;
  }
  
  // Si es string, verificar que solo contiene dígitos
  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) {
    return defaultValue;
  }
  
  // Convertir a número
  const numValue = Number(value);
  
  // Verificar que es un número válido, entero y positivo
  if (isNaN(numValue) || !Number.isInteger(numValue) || numValue <= 0) {
    return defaultValue;
  }
  
  return numValue;
};

/**
 * Valida parámetros de paginación
 * @param limit Límite de registros
 * @param offset Desplazamiento
 * @returns Objeto con valores validados
 */
export const validatePaginationParams = (
  limit?: number | string, 
  offset?: number | string
): { limit: number, offset: number } => {
  // Valores por defecto
  const defaultLimit = 10;
  const defaultOffset = 0;
  const maxLimit = 100;
  
  // Validar limit
  let validLimit = defaultLimit;
  if (limit !== undefined && limit !== null) {
    const limitNum = Number(limit);
    if (!isNaN(limitNum) && limitNum > 0) {
      validLimit = Math.min(Math.floor(limitNum), maxLimit);
    }
  }
  
  // Validar offset
  let validOffset = defaultOffset;
  if (offset !== undefined && offset !== null) {
    const offsetNum = Number(offset);
    if (!isNaN(offsetNum) && offsetNum >= 0) {
      validOffset = Math.floor(offsetNum);
    }
  }
  
  return { limit: validLimit, offset: validOffset };
};

/**
 * Valida una fecha
 * @param date Fecha a validar
 * @returns true si es una fecha válida, false en caso contrario
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  
  // Si es string, intentar convertir a Date
  if (typeof date === 'string') {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }
  
  // Si ya es un objeto Date
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  return false;
};

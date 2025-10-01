/**
 * Re-exporta las funciones de validación de IDs desde validationUtils.ts
 * para mantener la coherencia del código y evitar duplicación.
 * 
 * Este archivo sirve como punto central para todas las utilidades
 * relacionadas con la validación de IDs en la aplicación.
 */

import { isValidId, toValidId } from './validationUtils';

// Re-exportamos las funciones existentes
export { isValidId, toValidId };

/**
 * Convierte un valor a un ID válido o retorna null
 * @param id El ID a convertir
 * @returns El ID como número si es válido, null en caso contrario
 */
export const toValidIdOrNull = (id: any): number | null => {
  if (id === undefined || id === null) return null;
  const numId = Number(id);
  return !isNaN(numId) && numId > 0 ? numId : null;
};

/**
 * Filtra un array de IDs para eliminar los inválidos
 * @param ids Array de IDs a filtrar
 * @returns Array con solo los IDs válidos
 */
export const filterValidIds = (ids: any[]): number[] => {
  if (!Array.isArray(ids)) return [];
  
  return ids
    .map(id => toValidId(id))
    .filter((id): id is number => id !== undefined);
};

/**
 * Valida un ID y lanza un error si es inválido
 * @param id El ID a validar
 * @param entityName Nombre de la entidad para el mensaje de error
 * @returns El ID validado como número
 * @throws Error si el ID es inválido
 */
export const validateIdOrThrow = (id: any, entityName: string = 'entidad'): number => {
  const validId = toValidId(id);
  if (validId === undefined) {
    throw new Error(`ID de ${entityName} inválido: ${id}`);
  }
  return validId;
};

/**
 * Configuración centralizada de cajas
 * Para agregar una nueva caja, solo añade el número al array correspondiente
 */

export interface CajaConfig {
  id: number;
  nombre: string;
  tipo: 'super' | 'agente';
}

/**
 * Números de cajas disponibles para operación de Super
 * Para agregar Caja 3, solo agrega el número 3 al array
 */
export const CAJAS_SUPER_NUMEROS = [1, 2];

/**
 * Números de cajas disponibles para operación de Agentes
 * Actualmente no hay cajas específicas para agentes
 */
export const CAJAS_AGENTE_NUMEROS: number[] = [];

/**
 * Genera la configuración de cajas para un tipo específico
 */
export function getCajasConfig(tipo: 'super' | 'agente'): CajaConfig[] {
  const numeros = tipo === 'super' ? CAJAS_SUPER_NUMEROS : CAJAS_AGENTE_NUMEROS;
  
  return numeros.map(numero => ({
    id: numero,
    nombre: `Caja ${tipo === 'super' ? 'Super' : 'Agente'} ${numero}`,
    tipo
  }));
}

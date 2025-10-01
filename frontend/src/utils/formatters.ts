/**
 * Formatea un valor numérico como moneda (HNL)
 * @param value Valor a formatear
 * @returns Valor formateado como moneda
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea una fecha en formato legible
 * @param date Fecha a formatear
 * @returns Fecha formateada
 */
export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return 'N/A';
  
  // Si es un string, extraer los componentes de fecha directamente
  if (typeof date === 'string') {
    // Asumiendo formato ISO "YYYY-MM-DD" o "YYYY-MM-DDT..."
    const parts = date.split('T')[0].split('-');
    if (parts.length === 3) {
      // Crear fecha con la zona horaria local para evitar conversión UTC
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Meses en JS son 0-11
      const day = parseInt(parts[2]);
      
      return new Intl.DateTimeFormat('es-HN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(year, month, day));
    }
  }
  
  // Si es un objeto Date o el formato string no es el esperado
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Formatea una fecha y hora en formato legible
 * @param date Fecha y hora a formatear
 * @returns Fecha y hora formateada
 */
export const formatDateTime = (date: Date | string | undefined | null): string => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Formatea un valor booleano como texto
 * @param value Valor booleano
 * @returns Texto formateado
 */
export const formatBoolean = (value: boolean | undefined | null): string => {
  if (value === undefined || value === null) return 'N/A';
  return value ? 'Sí' : 'No';
};

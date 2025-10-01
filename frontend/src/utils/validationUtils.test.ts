import { isValidId, toValidId, validatePaginationParams, isValidDate } from './validationUtils';

describe('Utilidades de validación', () => {
  describe('isValidId', () => {
    it('debe retornar false para valores undefined, null o cadena vacía', () => {
      expect(isValidId(undefined)).toBe(false);
      expect(isValidId(null)).toBe(false);
      expect(isValidId('')).toBe(false);
      expect(isValidId('   ')).toBe(false);
    });

    it('debe retornar false para valores no numéricos', () => {
      expect(isValidId('abc')).toBe(false);
      expect(isValidId('123abc')).toBe(false);
      expect(isValidId('abc123')).toBe(false);
      expect(isValidId('12.3')).toBe(false);
      expect(isValidId('-123')).toBe(false);
    });

    it('debe retornar false para números no positivos', () => {
      expect(isValidId(0)).toBe(false);
      expect(isValidId(-1)).toBe(false);
      expect(isValidId('-1')).toBe(false);
      expect(isValidId('0')).toBe(false);
    });

    it('debe retornar true para IDs válidos', () => {
      expect(isValidId(1)).toBe(true);
      expect(isValidId('1')).toBe(true);
      expect(isValidId(123)).toBe(true);
      expect(isValidId('123')).toBe(true);
      expect(isValidId('00123')).toBe(true); // Ceros a la izquierda son válidos
    });
  });

  describe('toValidId', () => {
    it('debe retornar undefined para valores inválidos', () => {
      expect(toValidId(undefined)).toBeUndefined();
      expect(toValidId(null)).toBeUndefined();
      expect(toValidId('')).toBeUndefined();
      expect(toValidId('abc')).toBeUndefined();
      expect(toValidId('123abc')).toBeUndefined();
      expect(toValidId('-123')).toBeUndefined();
    });

    it('debe retornar el valor por defecto para valores inválidos cuando se proporciona', () => {
      expect(toValidId(undefined, 1)).toBe(1);
      expect(toValidId(null, 2)).toBe(2);
      expect(toValidId('', 3)).toBe(3);
      expect(toValidId('abc', 4)).toBe(4);
    });

    it('debe retornar el ID numérico para valores válidos', () => {
      expect(toValidId(1)).toBe(1);
      expect(toValidId('1')).toBe(1);
      expect(toValidId(123)).toBe(123);
      expect(toValidId('123')).toBe(123);
      expect(toValidId('00123')).toBe(123); // Ceros a la izquierda se eliminan
    });
  });

  describe('validatePaginationParams', () => {
    it('debe usar valores por defecto cuando no se proporcionan parámetros', () => {
      expect(validatePaginationParams()).toEqual({ limit: 10, offset: 0 });
      expect(validatePaginationParams(undefined, undefined)).toEqual({ limit: 10, offset: 0 });
    });

    it('debe validar y convertir parámetros de paginación válidos', () => {
      expect(validatePaginationParams(20, 5)).toEqual({ limit: 20, offset: 5 });
      expect(validatePaginationParams('20', '5')).toEqual({ limit: 20, offset: 5 });
    });

    it('debe aplicar límites máximos', () => {
      expect(validatePaginationParams(200, 5)).toEqual({ limit: 100, offset: 5 }); // Máximo 100
    });

    it('debe manejar valores inválidos', () => {
      expect(validatePaginationParams('abc', '-5')).toEqual({ limit: 10, offset: 0 });
      expect(validatePaginationParams(-10, -5)).toEqual({ limit: 10, offset: 0 });
    });

    it('debe redondear hacia abajo los valores decimales', () => {
      expect(validatePaginationParams(10.9, 5.9)).toEqual({ limit: 10, offset: 5 });
    });
  });

  describe('isValidDate', () => {
    it('debe retornar false para valores no fecha', () => {
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate('')).toBe(false);
      expect(isValidDate('abc')).toBe(false);
      expect(isValidDate(123)).toBe(false);
    });

    it('debe retornar true para objetos Date válidos', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2023-01-01'))).toBe(true);
    });

    it('debe retornar true para strings de fecha válidos', () => {
      expect(isValidDate('2023-01-01')).toBe(true);
      expect(isValidDate('2023-01-01T12:00:00')).toBe(true);
    });

    it('debe retornar false para fechas inválidas', () => {
      expect(isValidDate('2023-13-01')).toBe(false); // Mes inválido
      expect(isValidDate('2023-02-30')).toBe(false); // Día inválido
      expect(isValidDate(new Date('invalid'))).toBe(false); // Date inválido
    });
  });
});

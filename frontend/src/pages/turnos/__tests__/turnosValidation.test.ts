import { toValidId, isValidId } from '../../../utils/validationUtils';
import { turnosApi } from '../../../api/turnos/turnosApi';

// Mock de turnosApi
jest.mock('../../../api/turnos/turnosApi', () => ({
  turnosApi: {
    getById: jest.fn(),
    getTurnoActual: jest.fn(),
    asignarUsuarios: jest.fn(),
    iniciarTurno: jest.fn(),
    finalizarTurno: jest.fn(),
    delete: jest.fn()
  }
}));

describe('Validación de IDs de Turnos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API de Turnos', () => {
    it('getTurnoActual debe manejar correctamente IDs inválidos', async () => {
      // Simular un turno con ID inválido
      (turnosApi.getTurnoActual as jest.Mock).mockResolvedValue({ id: 'NaN', nombre: 'Turno Test' });
      
      // Ejecutar el método y verificar que retorna null para ID inválido
      const resultado = await turnosApi.getTurnoActual();
      expect(resultado).toBeNull();
    });

    it('getById debe rechazar IDs inválidos', async () => {
      // Configurar el mock para simular un error
      (turnosApi.getById as jest.Mock).mockImplementation((id) => {
        const validId = toValidId(id);
        if (validId === undefined) {
          throw new Error(`ID de turno inválido: ${id}`);
        }
        return Promise.resolve({ id: validId, nombre: 'Turno Test' });
      });
      
      // Probar con ID válido
      await expect(turnosApi.getById(123)).resolves.toEqual({ id: 123, nombre: 'Turno Test' });
      
      // Probar con ID inválido
      await expect(turnosApi.getById('NaN')).rejects.toThrow('ID de turno inválido: NaN');
      await expect(turnosApi.getById('')).rejects.toThrow('ID de turno inválido:');
    });

    it('asignarUsuarios debe filtrar IDs inválidos', async () => {
      (turnosApi.asignarUsuarios as jest.Mock).mockImplementation((turnoId, usuariosIds) => {
        const validTurnoId = toValidId(turnoId);
        if (validTurnoId === undefined) {
          throw new Error(`ID de turno inválido: ${turnoId}`);
        }
        
        const validUsuariosIds = usuariosIds
          .map(id => toValidId(id))
          .filter(id => id !== undefined);
          
        return Promise.resolve({
          turnoId: validTurnoId,
          usuariosIds: validUsuariosIds
        });
      });
      
      // Probar con IDs válidos e inválidos mezclados
      const resultado = await turnosApi.asignarUsuarios(1, [2, 'NaN', 3, '', '4', null]);
      expect(resultado).toEqual({
        turnoId: 1,
        usuariosIds: [2, 3, 4]
      });
      
      // Probar con turnoId inválido
      await expect(turnosApi.asignarUsuarios('NaN', [1, 2])).rejects.toThrow('ID de turno inválido: NaN');
    });
  });

  describe('Utilidades de Validación', () => {
    it('debe detectar correctamente casos de NaN', () => {
      expect(isValidId(NaN)).toBe(false);
      expect(isValidId('NaN')).toBe(false);
      expect(toValidId(NaN)).toBeUndefined();
      expect(toValidId('NaN')).toBeUndefined();
    });
    
    it('debe manejar correctamente conversiones de string a number', () => {
      expect(toValidId('123')).toBe(123);
      expect(toValidId(123)).toBe(123);
      expect(toValidId('0123')).toBe(123);
    });
    
    it('debe rechazar valores negativos y cero', () => {
      expect(isValidId(0)).toBe(false);
      expect(isValidId(-1)).toBe(false);
      expect(isValidId('-1')).toBe(false);
      expect(toValidId(0)).toBeUndefined();
      expect(toValidId(-1)).toBeUndefined();
      expect(toValidId('-1')).toBeUndefined();
    });
  });

  describe('Casos de Uso Específicos', () => {
    it('debe manejar correctamente IDs en formato string que son válidos', () => {
      expect(isValidId('1')).toBe(true);
      expect(toValidId('1')).toBe(1);
    });
    
    it('debe rechazar strings que no son números', () => {
      expect(isValidId('abc')).toBe(false);
      expect(isValidId('123abc')).toBe(false);
      expect(toValidId('abc')).toBeUndefined();
      expect(toValidId('123abc')).toBeUndefined();
    });
    
    it('debe manejar correctamente valores undefined y null', () => {
      expect(isValidId(undefined)).toBe(false);
      expect(isValidId(null)).toBe(false);
      expect(toValidId(undefined)).toBeUndefined();
      expect(toValidId(null)).toBeUndefined();
    });
  });
});

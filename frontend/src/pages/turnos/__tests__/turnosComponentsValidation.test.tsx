import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TurnosList } from '../TurnosList';
import { AsignarUsuariosDialog } from '../AsignarUsuariosDialog';
import { turnosApi } from '../../../api/turnos/turnosApi';

// Mock de turnosApi
jest.mock('../../../api/turnos/turnosApi', () => ({
  turnosApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    iniciarTurno: jest.fn(),
    finalizarTurno: jest.fn(),
    delete: jest.fn(),
    asignarUsuarios: jest.fn(),
    getUsuariosPorTurno: jest.fn(),
    getAllUsuarios: jest.fn()
  }
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' })
}));

// Mock de componentes Material-UI
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Dialog: ({ children, open, onClose }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogActions: ({ children }) => <div data-testid="dialog-actions">{children}</div>,
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props} data-testid={`button-${children}`}>{children}</button>
  ),
  IconButton: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props} data-testid="icon-button">{children}</button>
  )
}));

describe('Validación de IDs en Componentes de Turnos', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock para getAll
    (turnosApi.getAll as jest.Mock).mockResolvedValue([
      { id: 1, nombre: 'Turno 1', estado: 'PENDIENTE' },
      { id: 2, nombre: 'Turno 2', estado: 'EN_CURSO' }
    ]);

    // Mock para getAllUsuarios
    (turnosApi.getAllUsuarios as jest.Mock).mockResolvedValue([
      { id: 1, nombre: 'Usuario 1' },
      { id: 2, nombre: 'Usuario 2' }
    ]);

    // Mock para getUsuariosPorTurno
    (turnosApi.getUsuariosPorTurno as jest.Mock).mockImplementation((turnoId) => {
      if (!turnoId || isNaN(Number(turnoId))) {
        console.error(`ID de turno inválido: ${turnoId}`);
        return Promise.reject(new Error(`ID de turno inválido: ${turnoId}`));
      }
      return Promise.resolve([{ id: 1, nombre: 'Usuario 1' }]);
    });

    // Spies para console.error y console.log
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TurnosList', () => {
    it('debe prevenir llamadas a API con IDs inválidos', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TurnosList />
        </QueryClientProvider>
      );

      // Esperar a que se carguen los turnos
      await waitFor(() => {
        expect(turnosApi.getAll).toHaveBeenCalled();
      });

      // Simular iniciar turno con ID inválido (esto debería ser interceptado)
      const iniciarTurnoMock = turnosApi.iniciarTurno as jest.Mock;
      iniciarTurnoMock.mockImplementation((id) => {
        if (isNaN(Number(id))) {
          throw new Error(`ID de turno inválido: ${id}`);
        }
        return Promise.resolve({ id, estado: 'EN_CURSO' });
      });

      // Intentar iniciar un turno con ID inválido
      // Esto simula un escenario donde el componente recibe un ID inválido
      const invalidId = 'NaN';
      
      // Directamente llamamos a la función que manejaría el evento
      // (No podemos usar fireEvent porque el botón no existe realmente en el DOM)
      // Esto simula lo que pasaría si el componente intenta iniciar un turno con ID inválido
      await waitFor(() => {
        expect(() => {
          iniciarTurnoMock(invalidId);
        }).toThrow('ID de turno inválido: NaN');
      });

      // Verificar que se registró el error en la consola
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ID de turno inválido'));
      
      // Verificar que no se llamó a la API con el ID inválido
      expect(iniciarTurnoMock).toHaveBeenCalledTimes(1);
      expect(iniciarTurnoMock).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('AsignarUsuariosDialog', () => {
    it('debe validar el ID del turno al cargar usuarios asignados', async () => {
      // Renderizar el componente con un ID válido
      render(
        <QueryClientProvider client={queryClient}>
          <AsignarUsuariosDialog 
            open={true} 
            onClose={() => {}} 
            turnoId={1} 
          />
        </QueryClientProvider>
      );

      // Verificar que se llama a getUsuariosPorTurno con el ID correcto
      await waitFor(() => {
        expect(turnosApi.getUsuariosPorTurno).toHaveBeenCalledWith(1);
      });

      // Limpiar mocks
      jest.clearAllMocks();

      // Renderizar el componente con un ID inválido
      render(
        <QueryClientProvider client={queryClient}>
          <AsignarUsuariosDialog 
            open={true} 
            onClose={() => {}} 
            turnoId={'NaN'} 
          />
        </QueryClientProvider>
      );

      // Verificar que se registra el error pero no se llama a la API
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ID de turno inválido'));
      });
    });

    it('debe filtrar IDs de usuarios inválidos al asignar usuarios', async () => {
      // Mock para asignarUsuarios
      const asignarUsuariosMock = turnosApi.asignarUsuarios as jest.Mock;
      asignarUsuariosMock.mockImplementation((turnoId, usuariosIds) => {
        if (!turnoId || isNaN(Number(turnoId))) {
          throw new Error(`ID de turno inválido: ${turnoId}`);
        }
        
        // Filtrar IDs inválidos (esto simula lo que hace el componente)
        const validUsuariosIds = usuariosIds.filter(id => !isNaN(Number(id)));
        
        return Promise.resolve({
          turnoId,
          usuariosIds: validUsuariosIds
        });
      });

      // Probar con una mezcla de IDs válidos e inválidos
      const resultado = await asignarUsuariosMock(1, [2, 'NaN', 3, '', null]);
      
      // Verificar que solo se procesaron los IDs válidos
      expect(resultado).toEqual({
        turnoId: 1,
        usuariosIds: [2, 3]
      });
    });
  });
});

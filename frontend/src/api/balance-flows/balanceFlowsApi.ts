import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../api';
import { 
  BalanceFlow, 
  CreateBalanceFlowDto, 
  UpdateBalanceFlowDto 
} from './types';

// Constante para determinar si se usa mock o API real
const USE_MOCK = false;

// Datos mock para desarrollo
const mockBalanceFlows: BalanceFlow[] = [
  {
    id: 1,
    telefonicaId: 1,
    nombre: 'Flujo Mensual Tigo',
    saldoInicial: 5000,
    saldoComprado: 10000,
    saldoVendido: 8000,
    saldoFinal: 7000,
    fecha: '2025-08-01',
    activo: true,
  },
  {
    id: 2,
    telefonicaId: 2,
    nombre: 'Flujo Mensual Claro',
    saldoInicial: 3000,
    saldoComprado: 5000,
    saldoVendido: 4500,
    saldoFinal: 3500,
    fecha: '2025-08-01',
    activo: true,
  },
];

// Hook personalizado para gestionar flujos de saldo
export const useBalanceFlows = () => {
  const [balanceFlows, setBalanceFlows] = useState<BalanceFlow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los flujos de saldo
  const fetchBalanceFlows = useCallback(async (activo?: boolean) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Usar datos mock
        const filteredFlows = activo !== undefined 
          ? mockBalanceFlows.filter(flow => flow.activo === activo)
          : mockBalanceFlows;
        setBalanceFlows(filteredFlows);
      } else {
        // Usar API real
        let url = `${API_BASE_URL}/balance-flows`;
        if (activo !== undefined) {
          url += `?activo=${activo}`;
        }
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setBalanceFlows(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener flujos de saldo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener flujos de saldo activos
  const fetchActiveBalanceFlows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Filtrar datos mock activos
        setBalanceFlows(mockBalanceFlows.filter(flow => flow.activo));
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/active`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setBalanceFlows(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener flujos de saldo activos:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Obtener la suma de saldo vendido de registros activos
  const getSumSaldoVendido = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        // Calcular suma en datos mock
        const sum = mockBalanceFlows
          .filter(flow => flow.activo)
          .reduce((total, flow) => total + flow.saldoVendido, 0);
        return sum;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/sum-saldo-vendido`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const total = await response.json();
        return parseFloat(total) || 0;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener suma de saldo vendido:', err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener flujos de saldo por línea telefónica
  const fetchBalanceFlowsByPhoneLine = useCallback(async (phoneLineId: number) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Filtrar datos mock por línea telefónica
        setBalanceFlows(mockBalanceFlows.filter(flow => flow.telefonicaId === phoneLineId));
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/by-phone-line/${phoneLineId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setBalanceFlows(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener flujos de saldo por línea telefónica:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un flujo de saldo por ID
  const fetchBalanceFlowById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Buscar en datos mock
        const balanceFlow = mockBalanceFlows.find(flow => flow.id === id);
        if (!balanceFlow) {
          throw new Error('Flujo de saldo no encontrado');
        }
        return balanceFlow;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener flujo de saldo por ID:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo flujo de saldo
  const createBalanceFlow = useCallback(async (balanceFlowData: CreateBalanceFlowDto) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simular creación en datos mock
        const newBalanceFlow: BalanceFlow = {
          id: mockBalanceFlows.length + 1,
          ...balanceFlowData,
        };
        setBalanceFlows(prev => [...prev, newBalanceFlow]);
        return newBalanceFlow;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(balanceFlowData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const createdBalanceFlow = await response.json();
        setBalanceFlows(prev => [...prev, createdBalanceFlow]);
        return createdBalanceFlow;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al crear flujo de saldo:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar un flujo de saldo existente
  const updateBalanceFlow = useCallback(async (id: number, balanceFlowData: UpdateBalanceFlowDto) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simular actualización en datos mock
        const index = mockBalanceFlows.findIndex(flow => flow.id === id);
        if (index === -1) {
          throw new Error('Flujo de saldo no encontrado');
        }

        const updatedBalanceFlow = {
          ...mockBalanceFlows[index],
          ...balanceFlowData,
        };

        const updatedBalanceFlows = [...mockBalanceFlows];
        updatedBalanceFlows[index] = updatedBalanceFlow;
        setBalanceFlows(updatedBalanceFlows);
        return updatedBalanceFlow;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(balanceFlowData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const updatedBalanceFlow = await response.json();
        setBalanceFlows(prev =>
          prev.map(flow => (flow.id === id ? updatedBalanceFlow : flow))
        );
        return updatedBalanceFlow;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al actualizar flujo de saldo:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar un flujo de saldo
  const deleteBalanceFlow = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simular eliminación en datos mock
        const index = mockBalanceFlows.findIndex(flow => flow.id === id);
        if (index === -1) {
          throw new Error('Flujo de saldo no encontrado');
        }
        
        const updatedBalanceFlows = mockBalanceFlows.filter(flow => flow.id !== id);
        setBalanceFlows(updatedBalanceFlows);
        return true;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        setBalanceFlows(prev => prev.filter(flow => flow.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al eliminar flujo de saldo:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // La función updateBalanceAfterSale ha sido eliminada ya que ahora se usa recalcularSaldosVendidos
  
  // La función updateBalanceAfterSaleEdit ha sido eliminada ya que ahora se usa recalcularSaldosVendidos

  // Recalcular saldos vendidos y finales para todos los flujos activos
  const recalcularSaldosVendidos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simular recálculo en datos mock
        console.log('Recálculo de saldos simulado en modo mock');
        return { actualizados: mockBalanceFlows.length, errores: 0 };
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/recalcular-saldos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const resultado = await response.json();
        
        // Refrescar los datos después del recálculo
        await fetchBalanceFlows();
        
        return resultado.data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al recalcular saldos vendidos:', err);
      throw err; // Re-lanzar el error para manejarlo en el componente
    } finally {
      setLoading(false);
    }
  }, [fetchBalanceFlows]);

  // Obtener el saldo final del último flujo inactivo
  const getLastInactiveSaldoFinal = useCallback(async (telefonicaId: number, cajaNumero: number): Promise<number | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/balance-flows/last-inactive-saldo/${telefonicaId}/${cajaNumero}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[BalanceFlowsAPI] No se encontró flujo inactivo previo');
          return null;
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[BalanceFlowsAPI] Último saldo final obtenido:', data);
      return data?.saldoFinal ?? null;
    } catch (err) {
      console.error('Error al obtener último saldo final:', err);
      return null; // Retornar null en caso de error en lugar de lanzar excepción
    }
  }, []);

  return {
    balanceFlows,
    loading,
    error,
    fetchBalanceFlows,
    fetchActiveBalanceFlows,
    fetchBalanceFlowsByPhoneLine,
    fetchBalanceFlowById,
    createBalanceFlow,
    updateBalanceFlow,
    deleteBalanceFlow,
    getLastInactiveSaldoFinal,
    getSumSaldoVendido,
    recalcularSaldosVendidos,
  };
};

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
  const fetchBalanceFlows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Usar datos mock
        setBalanceFlows(mockBalanceFlows);
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows`, {
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

  // Actualizar saldo vendido y saldo final después de una venta
  const updateBalanceAfterSale = useCallback(async (flujoSaldoId: number, montoVenta: number) => {
    // No activar el estado de carga global para evitar renderizados innecesarios
    // Solo usamos loading local para esta operación específica
    let localLoading = true;
    let localError: string | null = null;

    try {
      // Primero obtener el flujo de saldo actual
      const currentFlow = await fetchBalanceFlowById(flujoSaldoId);
      
      if (!currentFlow) {
        throw new Error('Flujo de saldo no encontrado');
      }
      
      if (!currentFlow.activo) {
        throw new Error('El flujo de saldo no está activo');
      }
      
      // Calcular nuevos valores
      const nuevoSaldoVendido = Number(currentFlow.saldoVendido) + Number(montoVenta);
      const nuevoSaldoFinal = Number(currentFlow.saldoFinal) - Number(montoVenta);
      
      if (nuevoSaldoFinal < 0) {
        throw new Error('No hay suficiente saldo disponible para esta venta');
      }
      
      // Actualizar el flujo de saldo
      const updateData: UpdateBalanceFlowDto = {
        saldoVendido: nuevoSaldoVendido,
        saldoFinal: nuevoSaldoFinal
      };
      
      // Llamada directa a la API sin actualizar el estado global
      if (USE_MOCK) {
        // Simular actualización en datos mock
        const index = mockBalanceFlows.findIndex(flow => flow.id === flujoSaldoId);
        if (index === -1) {
          throw new Error('Flujo de saldo no encontrado');
        }

        const updatedBalanceFlow = {
          ...mockBalanceFlows[index],
          ...updateData,
        };

        return updatedBalanceFlow;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/${flujoSaldoId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
      }
    } catch (err) {
      localError = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al actualizar saldo después de venta:', err);
      throw err; // Re-lanzar el error para manejarlo en el componente
    } finally {
      localLoading = false;
    }
  }, [fetchBalanceFlowById]);
  
  // Actualizar saldo vendido y saldo final al modificar una venta existente
  const updateBalanceAfterSaleEdit = useCallback(async (flujoSaldoId: number, montoAnterior: number, montoNuevo: number) => {
    // No activar el estado de carga global para evitar renderizados innecesarios
    // Solo usamos loading local para esta operación específica
    let localLoading = true;
    let localError: string | null = null;

    try {
      // Primero obtener el flujo de saldo actual
      const currentFlow = await fetchBalanceFlowById(flujoSaldoId);
      
      if (!currentFlow) {
        throw new Error('Flujo de saldo no encontrado');
      }
      
      if (!currentFlow.activo) {
        throw new Error('El flujo de saldo no está activo');
      }
      
      // Si los montos son iguales, no hay nada que actualizar
      if (Number(montoAnterior) === Number(montoNuevo)) {
        console.log('[updateBalanceAfterSaleEdit] Montos iguales, no se requiere actualización');
        return currentFlow;
      }
      
      // Calcular nuevos valores
      // 1. Restar el monto anterior del saldo vendido
      // 2. Sumar el monto nuevo al saldo vendido
      // 3. Sumar el monto anterior al saldo final
      // 4. Restar el monto nuevo del saldo final
      const nuevoSaldoVendido = Number(currentFlow.saldoVendido) - Number(montoAnterior) + Number(montoNuevo);
      const nuevoSaldoFinal = Number(currentFlow.saldoFinal) + Number(montoAnterior) - Number(montoNuevo);
      
      console.log(`[updateBalanceAfterSaleEdit] Valores calculados: saldoVendido=${nuevoSaldoVendido}, saldoFinal=${nuevoSaldoFinal}`);
      
      if (nuevoSaldoFinal < 0) {
        throw new Error('No hay suficiente saldo disponible para esta modificación');
      }
      
      // Actualizar el flujo de saldo
      const updateData: UpdateBalanceFlowDto = {
        saldoVendido: nuevoSaldoVendido,
        saldoFinal: nuevoSaldoFinal
      };
      
      // Llamada directa a la API sin actualizar el estado global
      if (USE_MOCK) {
        // Simular actualización en datos mock
        const index = mockBalanceFlows.findIndex(flow => flow.id === flujoSaldoId);
        if (index === -1) {
          throw new Error('Flujo de saldo no encontrado');
        }

        const updatedBalanceFlow = {
          ...mockBalanceFlows[index],
          ...updateData,
        };

        return updatedBalanceFlow;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/balance-flows/${flujoSaldoId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
      }
    } catch (err) {
      localError = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al actualizar saldo después de modificar venta:', err);
      throw err; // Re-lanzar el error para manejarlo en el componente
    } finally {
      localLoading = false;
    }
  }, [fetchBalanceFlowById]);

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
    updateBalanceAfterSale,
    updateBalanceAfterSaleEdit,
  };
};

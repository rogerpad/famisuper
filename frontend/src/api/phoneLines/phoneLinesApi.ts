import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../api';
import { PhoneLine, CreatePhoneLineDto, UpdatePhoneLineDto } from './types';

// Constante para determinar si se usa mock o API real
const USE_MOCK = false;

// Datos mock para desarrollo
const mockPhoneLines: PhoneLine[] = [
  {
    id: 1,
    nombre: 'Línea Principal',
    descripcion: 'Línea telefónica principal de la empresa',
    activo: true,
    // Campos de fecha eliminados
  },
  {
    id: 2,
    nombre: 'Línea Secundaria',
    descripcion: 'Línea telefónica secundaria para atención al cliente',
    activo: true,
    // Campos de fecha eliminados
  },
  {
    id: 3,
    nombre: 'Línea de Emergencia',
    descripcion: 'Línea telefónica para emergencias',
    activo: false,
    // Campos de fecha eliminados
  },
];

// Hook personalizado para gestionar líneas telefónicas
export const usePhoneLines = () => {
  const [phoneLines, setPhoneLines] = useState<PhoneLine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las líneas telefónicas
  const fetchPhoneLines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Usar datos mock
        setPhoneLines(mockPhoneLines);
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/phone-lines`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setPhoneLines(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener líneas telefónicas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener líneas telefónicas activas
  const fetchActivePhoneLines = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Filtrar datos mock para obtener solo activos
        setPhoneLines(mockPhoneLines.filter(line => line.activo));
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/phone-lines/active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setPhoneLines(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al obtener líneas telefónicas activas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una línea telefónica por ID
  const getPhoneLineById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Buscar en datos mock
        const phoneLine = mockPhoneLines.find(line => line.id === id);
        return phoneLine || null;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/phone-lines/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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
      console.error(`Error al obtener línea telefónica con ID ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una nueva línea telefónica
  const createPhoneLine = useCallback(async (phoneLineData: CreatePhoneLineDto) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simular creación en datos mock
        const newPhoneLine: PhoneLine = {
          id: mockPhoneLines.length + 1,
          ...phoneLineData,
          // Campos de fecha eliminados
        };
        setPhoneLines(prev => [...prev, newPhoneLine]);
        return newPhoneLine;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/phone-lines`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(phoneLineData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const createdPhoneLine = await response.json();
        setPhoneLines(prev => [...prev, createdPhoneLine]);
        return createdPhoneLine;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al crear línea telefónica:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una línea telefónica existente
  const updatePhoneLine = useCallback(async (id: number, phoneLineData: UpdatePhoneLineDto) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simular actualización en datos mock
        const index = mockPhoneLines.findIndex(line => line.id === id);
        if (index === -1) {
          throw new Error('Línea telefónica no encontrada');
        }

        const updatedPhoneLine = {
          ...mockPhoneLines[index],
          ...phoneLineData,
          // Campo de fecha eliminado
        };

        const updatedPhoneLines = [...mockPhoneLines];
        updatedPhoneLines[index] = updatedPhoneLine;
        setPhoneLines(updatedPhoneLines);
        return updatedPhoneLine;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/phone-lines/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(phoneLineData),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const updatedPhoneLine = await response.json();
        setPhoneLines(prev =>
          prev.map(line => (line.id === id ? updatedPhoneLine : line))
        );
        return updatedPhoneLine;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error(`Error al actualizar línea telefónica con ID ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una línea telefónica
  const deletePhoneLine = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simular eliminación en datos mock
        const filteredPhoneLines = mockPhoneLines.filter(line => line.id !== id);
        setPhoneLines(filteredPhoneLines);
        return true;
      } else {
        // Usar API real
        const response = await fetch(`${API_BASE_URL}/phone-lines/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        setPhoneLines(prev => prev.filter(line => line.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error(`Error al eliminar línea telefónica con ID ${id}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    phoneLines,
    loading,
    error,
    fetchPhoneLines,
    fetchActivePhoneLines,
    getPhoneLineById,
    createPhoneLine,
    updatePhoneLine,
    deletePhoneLine,
  };
};

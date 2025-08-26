import { useState, useCallback } from 'react';
import { ConteoBilletesSuper, ConteoBilletesSuperFormData } from './types';

// Funciones utilitarias para conversión segura de tipos
const safeParseInt = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const safeParseFloat = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
};

const ensureNumber = (value: any, defaultValue = 0): number => {
  if (typeof value === 'number') return value;
  return safeParseFloat(value, defaultValue);
};

// Función para normalizar los datos de conteo recibidos del backend
const normalizeConteoData = (conteo: any): ConteoBilletesSuper => {
  return {
    id: safeParseInt(conteo.id),
    usuarioId: safeParseInt(conteo.usuarioId),
    deno500: safeParseInt(conteo.deno500, 500),
    cant500: safeParseInt(conteo.cant500, 0),
    total500: ensureNumber(conteo.total500, 0),
    deno200: safeParseInt(conteo.deno200, 200),
    cant200: safeParseInt(conteo.cant200, 0),
    total200: ensureNumber(conteo.total200, 0),
    deno100: safeParseInt(conteo.deno100, 100),
    cant100: safeParseInt(conteo.cant100, 0),
    total100: ensureNumber(conteo.total100, 0),
    deno50: safeParseInt(conteo.deno50, 50),
    cant50: safeParseInt(conteo.cant50, 0),
    total50: ensureNumber(conteo.total50, 0),
    deno20: safeParseInt(conteo.deno20, 20),
    cant20: safeParseInt(conteo.cant20, 0),
    total20: ensureNumber(conteo.total20, 0),
    deno10: safeParseInt(conteo.deno10, 10),
    cant10: safeParseInt(conteo.cant10, 0),
    total10: ensureNumber(conteo.total10, 0),
    deno5: safeParseInt(conteo.deno5, 5),
    cant5: safeParseInt(conteo.cant5, 0),
    total5: ensureNumber(conteo.total5, 0),
    deno2: safeParseInt(conteo.deno2, 2),
    cant2: safeParseInt(conteo.cant2, 0),
    total2: ensureNumber(conteo.total2, 0),
    deno1: safeParseInt(conteo.deno1, 1),
    cant1: safeParseInt(conteo.cant1, 0),
    total1: ensureNumber(conteo.total1, 0),
    totalGeneral: ensureNumber(conteo.totalGeneral, 0),
    activo: Boolean(conteo.activo),
    fecha: conteo.fecha || new Date().toISOString(),
    usuario: conteo.usuario ? {
      id: safeParseInt(conteo.usuario.id),
      nombre: conteo.usuario.nombre || '',
      apellido: conteo.usuario.apellido || '',
    } : undefined,
  };
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';

export const useConteoBilletesSuper = () => {
  const [conteoBilletesSuper, setConteoBilletesSuper] = useState<ConteoBilletesSuper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los conteos
  const fetchConteoBilletesSuper = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener conteos: ${response.statusText}`);
      }

      const data = await response.json();
      // Normalizar los datos para asegurar tipos correctos
      const normalizedData = Array.isArray(data) ? data.map(normalizeConteoData) : [];
      setConteoBilletesSuper(normalizedData);
      return normalizedData;
    } catch (err: any) {
      console.error('Error al cargar conteos de billetes:', err);
      setError(err.message || 'Error al cargar conteos de billetes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un conteo por ID
  const fetchConteoBilletesSuperById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener conteo: ${response.statusText}`);
      }

      const data = await response.json();
      // Normalizar los datos para asegurar tipos correctos
      return normalizeConteoData(data);
    } catch (err: any) {
      console.error(`Error al cargar conteo de billetes con ID ${id}:`, err);
      setError(err.message || 'Error al cargar conteo de billetes');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo conteo
  const createConteoBilletesSuper = useCallback(async (conteoData: ConteoBilletesSuperFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conteoData),
      });

      if (!response.ok) {
        throw new Error(`Error al crear conteo: ${response.statusText}`);
      }

      const data = await response.json();
      // Normalizar los datos para asegurar tipos correctos
      const normalizedData = normalizeConteoData(data);
      await fetchConteoBilletesSuper(); // Actualizar la lista después de crear
      return normalizedData;
    } catch (err: any) {
      console.error('Error al crear conteo de billetes:', err);
      setError(err.message || 'Error al crear conteo de billetes');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchConteoBilletesSuper]);

  // Actualizar un conteo existente
  const updateConteoBilletesSuper = useCallback(async (id: number, conteoData: Partial<ConteoBilletesSuperFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conteoData),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar conteo: ${response.statusText}`);
      }

      const data = await response.json();
      // Normalizar los datos para asegurar tipos correctos
      const normalizedData = normalizeConteoData(data);
      await fetchConteoBilletesSuper(); // Actualizar la lista después de modificar
      return normalizedData;
    } catch (err: any) {
      console.error(`Error al actualizar conteo de billetes con ID ${id}:`, err);
      setError(err.message || 'Error al actualizar conteo de billetes');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchConteoBilletesSuper]);

  // Eliminar un conteo
  const deleteConteoBilletesSuper = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar conteo: ${response.statusText}`);
      }

      await fetchConteoBilletesSuper(); // Actualizar la lista después de eliminar
      return true;
    } catch (err: any) {
      console.error(`Error al eliminar conteo de billetes con ID ${id}:`, err);
      setError(err.message || 'Error al eliminar conteo de billetes');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchConteoBilletesSuper]);

  return {
    conteoBilletesSuper,
    loading,
    error,
    fetchConteoBilletesSuper,
    fetchConteoBilletesSuperById,
    createConteoBilletesSuper,
    updateConteoBilletesSuper,
    deleteConteoBilletesSuper,
  };
};

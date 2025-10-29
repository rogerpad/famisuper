import { useState, useCallback } from 'react';
import { SuperBillCount, SuperBillCountFormData } from './types';

// Utility functions for safe type conversion
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

// Function to normalize count data received from backend
const normalizeCountData = (count: any): SuperBillCount => {
  return {
    id: safeParseInt(count.id),
    usuarioId: safeParseInt(count.usuarioId),
    deno500: safeParseInt(count.deno500, 500),
    cant500: safeParseInt(count.cant500, 0),
    total500: ensureNumber(count.total500, 0),
    deno200: safeParseInt(count.deno200, 200),
    cant200: safeParseInt(count.cant200, 0),
    total200: ensureNumber(count.total200, 0),
    deno100: safeParseInt(count.deno100, 100),
    cant100: safeParseInt(count.cant100, 0),
    total100: ensureNumber(count.total100, 0),
    deno50: safeParseInt(count.deno50, 50),
    cant50: safeParseInt(count.cant50, 0),
    total50: ensureNumber(count.total50, 0),
    deno20: safeParseInt(count.deno20, 20),
    cant20: safeParseInt(count.cant20, 0),
    total20: ensureNumber(count.total20, 0),
    deno10: safeParseInt(count.deno10, 10),
    cant10: safeParseInt(count.cant10, 0),
    total10: ensureNumber(count.total10, 0),
    deno5: safeParseInt(count.deno5, 5),
    cant5: safeParseInt(count.cant5, 0),
    total5: ensureNumber(count.total5, 0),
    deno2: safeParseInt(count.deno2, 2),
    cant2: safeParseInt(count.cant2, 0),
    total2: ensureNumber(count.total2, 0),
    deno1: safeParseInt(count.deno1, 1),
    cant1: safeParseInt(count.cant1, 0),
    total1: ensureNumber(count.total1, 0),
    totalGeneral: ensureNumber(count.totalGeneral, 0),
    activo: Boolean(count.activo),
    fecha: count.fecha || new Date().toISOString(),
    cajaNumero: count.cajaNumero,
    usuario: count.usuario ? {
      id: safeParseInt(count.usuario.id),
      nombre: count.usuario.nombre || '',
      apellido: count.usuario.apellido || '',
    } : undefined,
  };
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';

export const useSuperBillCount = () => {
  const [superBillCounts, setSuperBillCounts] = useState<SuperBillCount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get all counts
  const fetchSuperBillCounts = useCallback(async (activo?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let url = `${API_URL}/conteo-billetes-super`;
      if (activo !== undefined) {
        url += `?activo=${activo}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error loading counts: ${response.statusText}`);
      }

      const data = await response.json();
      const normalizedData = Array.isArray(data) ? data.map(normalizeCountData) : [];
      setSuperBillCounts(normalizedData);
      return normalizedData;
    } catch (err: any) {
      console.error('Error loading bill counts:', err);
      setError(err.message || 'Error loading bill counts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get count by ID
  const fetchSuperBillCountById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error loading count: ${response.statusText}`);
      }

      const data = await response.json();
      return normalizeCountData(data);
    } catch (err: any) {
      console.error(`Error loading bill count with ID ${id}:`, err);
      setError(err.message || 'Error loading bill count');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new count
  const createSuperBillCount = useCallback(async (countData: SuperBillCountFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(countData),
      });

      if (!response.ok) {
        throw new Error(`Error creating count: ${response.statusText}`);
      }

      const data = await response.json();
      const normalizedData = normalizeCountData(data);
      await fetchSuperBillCounts();
      return normalizedData;
    } catch (err: any) {
      console.error('Error creating bill count:', err);
      setError(err.message || 'Error creating bill count');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchSuperBillCounts]);

  // Update existing count
  const updateSuperBillCount = useCallback(async (id: number, countData: Partial<SuperBillCountFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(countData),
      });

      if (!response.ok) {
        throw new Error(`Error updating count: ${response.statusText}`);
      }

      const data = await response.json();
      const normalizedData = normalizeCountData(data);
      await fetchSuperBillCounts();
      return normalizedData;
    } catch (err: any) {
      console.error(`Error updating bill count with ID ${id}:`, err);
      setError(err.message || 'Error updating bill count');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchSuperBillCounts]);

  // Delete count
  const deleteSuperBillCount = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/conteo-billetes-super/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting count: ${response.statusText}`);
      }

      await fetchSuperBillCounts();
      return true;
    } catch (err: any) {
      console.error(`Error deleting bill count with ID ${id}:`, err);
      setError(err.message || 'Error deleting bill count');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSuperBillCounts]);

  // Get last active bill count (filtrado por caja)
  const getLastActiveBillCount = useCallback(async (cajaNumero?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Authentication token not found for bill count');
        return null;
      }

      const url = cajaNumero
        ? `${API_URL}/conteo-billetes-super/last-active?cajaNumero=${cajaNumero}`
        : `${API_URL}/conteo-billetes-super/last-active`;
      
      console.log(`[SUPER_BILL_COUNT_API] Obteniendo último conteo activo - Caja: ${cajaNumero || 'Todas'}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Silent 404 handling - expected when no active counts
          console.log(`[SUPER_BILL_COUNT_API] No se encontró conteo activo para Caja ${cajaNumero || 'general'}`);
          return null;
        }
        console.error(`Error loading last active count: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log(`[SUPER_BILL_COUNT_API] Conteo activo obtenido - Total: ${data.totalGeneral}`);
      return normalizeCountData(data);
    } catch (err: any) {
      // Only log errors that aren't network/404
      if (err.name !== 'TypeError' && !err.message?.includes('fetch')) {
        console.error('Unexpected error loading last active bill count:', err);
      }
      return null;
    }
  }, []);

  return {
    superBillCounts,
    loading,
    error,
    fetchSuperBillCounts,
    fetchSuperBillCountById,
    createSuperBillCount,
    updateSuperBillCount,
    deleteSuperBillCount,
    getLastActiveBillCount,
  };
};

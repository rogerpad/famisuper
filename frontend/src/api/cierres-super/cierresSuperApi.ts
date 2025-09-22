import { useState, useCallback } from 'react';
import api from '../api';
import { API_BASE_URL } from '../../api/config';
import { CierreSuper, CierreSuperFormData, CierreSuperFilters } from './types';

export const useCierresSuper = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cierresSuper, setCierresSuper] = useState<CierreSuper[]>([]);
  const [cierreSuper, setCierreSuper] = useState<CierreSuper | null>(null);

  // Obtener todos los cierres
  const fetchCierresSuper = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CierreSuper[]>(`${API_BASE_URL}/cierres-super`);
      setCierresSuper(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener los cierres');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener cierres activos
  const fetchCierresSuperActivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CierreSuper[]>(`${API_BASE_URL}/cierres-super/activos`);
      setCierresSuper(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener los cierres activos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un cierre por ID
  const fetchCierreSuperById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CierreSuper>(`${API_BASE_URL}/cierres-super/${id}`);
      setCierreSuper(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al obtener el cierre con ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo cierre
  const createCierreSuper = useCallback(async (data: CierreSuperFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<CierreSuper>(`${API_BASE_URL}/cierres-super`, data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el cierre');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar un cierre existente
  const updateCierreSuper = useCallback(async (id: number, data: Partial<CierreSuperFormData>) => {
    setLoading(true);
    setError(null);
    try {
      // Filtrar propiedades que no deben enviarse en la actualización
      const { id: _, usuario, ...updateData } = data as any;
      
      const response = await api.patch<CierreSuper>(`${API_BASE_URL}/cierres-super/${id}`, updateData);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al actualizar el cierre con ID ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar un cierre
  const deleteCierreSuper = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`${API_BASE_URL}/cierres-super/${id}`);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al eliminar el cierre con ID ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener cierres por usuario
  const fetchCierresSuperByUsuario = useCallback(async (usuarioId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CierreSuper[]>(`${API_BASE_URL}/cierres-super/usuario/${usuarioId}`);
      setCierresSuper(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error al obtener los cierres del usuario ${usuarioId}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener cierres por rango de fechas
  const fetchCierresSuperByFecha = useCallback(async (fechaInicio: Date, fechaFin: Date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CierreSuper[]>(
        `${API_BASE_URL}/cierres-super/fecha/rango?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`
      );
      setCierresSuper(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener los cierres por fecha');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar cierres con múltiples criterios
  const filterCierresSuper = useCallback(async (filters: CierreSuperFilters) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/cierres-super`;
      const queryParams = [];
      
      if (filters.fechaInicio && filters.fechaFin) {
        url = `${API_BASE_URL}/cierres-super/fecha/rango`;
        queryParams.push(`fechaInicio=${filters.fechaInicio.toISOString()}`);
        queryParams.push(`fechaFin=${filters.fechaFin.toISOString()}`);
      } else if (filters.usuarioId) {
        url = `${API_BASE_URL}/cierres-super/usuario/${filters.usuarioId}`;
      } else if (filters.activo !== undefined) {
        url = `${API_BASE_URL}/cierres-super/activos`;
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await api.get<CierreSuper[]>(url);
      setCierresSuper(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al filtrar los cierres');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener el último cierre inactivo del día para efectivo inicial
  const getUltimoCierreInactivoDelDia = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get<{ efectivoCierreTurno: number } | null>(
        `${API_BASE_URL}/cierres-super/ultimo-cierre-inactivo-dia`
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener el último cierre inactivo del día');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    cierresSuper,
    cierreSuper,
    fetchCierresSuper,
    fetchCierresSuperActivos,
    fetchCierreSuperById,
    createCierreSuper,
    updateCierreSuper,
    deleteCierreSuper,
    fetchCierresSuperByUsuario,
    fetchCierresSuperByFecha,
    filterCierresSuper,
    getUltimoCierreInactivoDelDia,
  };
};

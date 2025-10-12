import { useState, useCallback } from 'react';
import api from '../api';
import { API_BASE_URL } from '../../api/config';
import { SuperClosing, SuperClosingFormData, SuperClosingFilters } from './types';

export const useSuperClosings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [superClosings, setSuperClosings] = useState<SuperClosing[]>([]);
  const [superClosing, setSuperClosing] = useState<SuperClosing | null>(null);

  // Get all closings
  const fetchSuperClosings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SuperClosing[]>(`${API_BASE_URL}/cierres-super`);
      setSuperClosings(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading closings');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get active closings
  const fetchActiveSuperClosings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SuperClosing[]>(`${API_BASE_URL}/cierres-super/activos`);
      setSuperClosings(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading active closings');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get closing by ID
  const fetchSuperClosingById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SuperClosing>(`${API_BASE_URL}/cierres-super/${id}`);
      setSuperClosing(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error loading closing with ID ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new closing
  const createSuperClosing = useCallback(async (data: SuperClosingFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<SuperClosing>(`${API_BASE_URL}/cierres-super`, data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating closing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing closing
  const updateSuperClosing = useCallback(async (id: number, data: Partial<SuperClosingFormData>) => {
    setLoading(true);
    setError(null);
    try {
      // Filter properties that shouldn't be sent in update
      const { id: _, usuario, ...updateData } = data as any;
      
      const response = await api.patch<SuperClosing>(`${API_BASE_URL}/cierres-super/${id}`, updateData);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error updating closing with ID ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete closing
  const deleteSuperClosing = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`${API_BASE_URL}/cierres-super/${id}`);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error deleting closing with ID ${id}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get closings by user
  const fetchSuperClosingsByUser = useCallback(async (usuarioId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SuperClosing[]>(`${API_BASE_URL}/cierres-super/usuario/${usuarioId}`);
      setSuperClosings(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || `Error loading closings for user ${usuarioId}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get closings by date range
  const fetchSuperClosingsByDate = useCallback(async (fechaInicio: Date, fechaFin: Date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<SuperClosing[]>(
        `${API_BASE_URL}/cierres-super/fecha/rango?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`
      );
      setSuperClosings(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading closings by date');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter closings with multiple criteria
  const filterSuperClosings = useCallback(async (filters: SuperClosingFilters) => {
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
      
      const response = await api.get<SuperClosing[]>(url);
      setSuperClosings(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error filtering closings');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get last inactive closing of the day for initial cash
  const getLastInactiveClosingOfDay = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get<{ efectivoCierreTurno: number } | null>(
        `${API_BASE_URL}/cierres-super/ultimo-cierre-inactivo-dia`
      );
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading last inactive closing of day');
      return null;
    }
  }, []);

  return {
    loading,
    error,
    superClosings,
    superClosing,
    fetchSuperClosings,
    fetchActiveSuperClosings,
    fetchSuperClosingById,
    createSuperClosing,
    updateSuperClosing,
    deleteSuperClosing,
    fetchSuperClosingsByUser,
    fetchSuperClosingsByDate,
    filterSuperClosings,
    getLastInactiveClosingOfDay,
  };
};

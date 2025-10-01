import { useState } from 'react';
import { API_BASE_URL } from '../api';
import { PhoneLine } from './types';

export const usePhoneLines = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneLines, setPhoneLines] = useState<PhoneLine[]>([]);

  const fetchPhoneLines = async (): Promise<PhoneLine[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/phone-lines`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error al obtener líneas telefónicas: ${response.statusText}`);
      }
      const data = await response.json();
      setPhoneLines(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener líneas telefónicas');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoneLineById = async (id: number): Promise<PhoneLine | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/phone-lines/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error al obtener línea telefónica: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener línea telefónica');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    phoneLines,
    fetchPhoneLines,
    fetchPhoneLineById
  };
};

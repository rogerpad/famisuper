import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { getAuthHeaders } from '../api/auth/authUtils';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  username: string;
  email?: string;
  activo: boolean;
  rolId?: number;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
    } catch (err) {
      console.error('[USE_USERS] Error al obtener usuarios:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

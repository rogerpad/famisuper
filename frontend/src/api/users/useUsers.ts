import { useState } from 'react';
import { API_BASE_URL } from '../api';
import { User } from './types';

export const useUsers = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async (): Promise<User[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (id: number): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error al obtener usuario: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener usuario');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    users,
    fetchUsers,
    fetchUserById
  };
};

import api from '../api';
import { useState } from 'react';
import { API_BASE_URL } from '../api';
import { User as UserBase } from './types';

// Extender el tipo User para incluir propiedades adicionales usadas en la aplicación
export interface User extends UserBase {
  rol_id?: number;
  fecha_registro?: Date;
  ultimo_acceso?: Date;
}

// Interfaces para crear y actualizar usuarios
export interface CreateUserDto {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email?: string;
  activo?: boolean;
  rol_id: number;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  activo?: boolean;
  rol_id?: number;
}

const usersApi = {
  // Obtener todos los usuarios
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Obtener un usuario por ID
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Crear un nuevo usuario
  create: async (userData: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Actualizar un usuario existente
  update: async (id: number, userData: UpdateUserDto): Promise<User> => {
    try {
      console.log(`Enviando solicitud PATCH a /users/${id} con datos:`, userData);
      const response = await api.patch(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error.response?.data || error.message);
      throw error;
    }
  },

  // Eliminar un usuario
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

export default usersApi;

// Hook para usar usuarios
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

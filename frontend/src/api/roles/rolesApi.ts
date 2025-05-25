import axios from 'axios';
import { API_BASE_URL } from '../api';

// Interfaces
export interface Role {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CreateRoleDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateRoleDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// API functions
const rolesApi = {
  // Obtener todos los roles
  getAll: async (): Promise<Role[]> => {
    const response = await axios.get(`${API_BASE_URL}/roles`);
    return response.data;
  },

  // Obtener roles activos
  getActive: async (): Promise<Role[]> => {
    const response = await axios.get(`${API_BASE_URL}/roles/active`);
    return response.data;
  },

  // Obtener un rol por su ID
  getById: async (id: number): Promise<Role> => {
    const response = await axios.get(`${API_BASE_URL}/roles/${id}`);
    return response.data;
  },

  // Crear un nuevo rol
  create: async (role: CreateRoleDto): Promise<Role> => {
    const response = await axios.post(`${API_BASE_URL}/roles`, role);
    return response.data;
  },

  // Actualizar un rol existente
  update: async (id: number, role: UpdateRoleDto): Promise<Role> => {
    const response = await axios.patch(`${API_BASE_URL}/roles/${id}`, role);
    return response.data;
  },

  // Eliminar un rol
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/roles/${id}`);
  },

  // Cambiar el estado de un rol (activo/inactivo)
  toggleStatus: async (id: number): Promise<Role> => {
    const response = await axios.patch(`${API_BASE_URL}/roles/${id}/toggle-status`);
    return response.data;
  }
};

export default rolesApi;

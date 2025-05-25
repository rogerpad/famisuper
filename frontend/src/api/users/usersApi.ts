import api from '../api';

export interface User {
  id: number;
  username: string;
  nombre: string;
  apellido?: string;
  email?: string;
  activo: boolean;
  rol_id: number;
  fecha_registro: Date;
  ultimo_acceso?: Date;
  rol?: {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  };
}

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

import api from '../api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    email?: string;
    rol: {
      id: number;
      nombre: string;
      descripcion?: string;
      activo: boolean;
    };
  };
}

const authApi = {
  // Iniciar sesión
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

export default authApi;

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
    try {
      console.log('Enviando solicitud de login con credenciales:', {
        username: credentials.username,
        password: credentials.password
      });
      
      // Validar credenciales antes de enviar
      if (!credentials.username || !credentials.password) {
        throw new Error('Credenciales incompletas: se requiere nombre de usuario y contraseña');
      }
      
      // Crear un objeto limpio para evitar datos adicionales no deseados
      const loginData = {
        username: credentials.username.trim(),
        password: credentials.password
      };
      
      // Configuración específica para la solicitud de login
      const response = await api.post<LoginResponse>('/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Aumentar el tiempo de espera para entornos lentos
        timeout: 10000
      });
      
      // Validar la respuesta
      if (!response.data || !response.data.access_token) {
        throw new Error('Respuesta inválida del servidor: no se recibió token de acceso');
      }
      
      console.log('Login exitoso, token recibido');
      
      // Guardar token inmediatamente en localStorage
      if (response.data && response.data.access_token) {
        console.log('Guardando token en localStorage desde authApi');
        localStorage.setItem('token', response.data.access_token);
        
        if (response.data.user) {
          console.log('Guardando datos de usuario en localStorage desde authApi');
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error: any) {
      // Preservar el error original para que el componente Login pueda manejarlo específicamente
      console.error('Error en la solicitud API:', error);
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
        console.error('Cabeceras:', error.response.headers);
        
        // Re-lanzar el error original para que el componente Login pueda acceder a error.response
        throw error;
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
      
      console.error('Error en la solicitud de login:', error);
      throw error;
    }
  }
};

export default authApi;

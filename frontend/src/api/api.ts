import axios from 'axios';

// Definir la URL base de la API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Habilitar credenciales para solicitudes CORS
  withCredentials: true,
  // Asegurar que los datos se serialicen correctamente
  transformRequest: [(data, headers) => {
    // Si los datos ya son una cadena (probablemente ya JSON.stringify), devolverlos tal cual
    if (typeof data === 'string') {
      return data;
    }
    // De lo contrario, convertirlos a JSON
    if (data && headers && headers['Content-Type'] === 'application/json') {
      return JSON.stringify(data);
    }
    return data;
  }],
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Mostrar información detallada sobre el error en la consola para depuración
    console.error('Error en la solicitud API:', error);
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Código de estado:', error.response.status);
      console.error('Cabeceras:', error.response.headers);
      
      // Verificar si es un error de autenticación (401) y no estamos en la página de login
      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        console.log('Error 401 detectado, redirigiendo a login');
        // Limpiar datos de autenticación
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('operacionActiva');
        
        // Usar setTimeout para evitar problemas de redirección durante una solicitud en curso
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor', error.request);
    } else {
      // Algo ocurrió al configurar la solicitud que desencadenó un error
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

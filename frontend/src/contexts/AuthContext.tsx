import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/auth/authApi';
import jwtDecode from 'jwt-decode';

interface User {
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
  turno?: {
    id: number;
    nombre: string;
    horaInicio: string;
    horaFin: string;
    descripcion?: string;
    activo: boolean;
    agente: boolean;
    super: boolean;
  };
}

interface JwtPayload {
  sub: number;
  username: string;
  rol: number;
  rolName: string;
  permissions: string[];
  iat: number;
  exp: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  permissions: Record<string, boolean>;
  loading: boolean;
  operationType?: 'agente' | 'super' | null;
}

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isOperationType: (type: 'agente' | 'super') => boolean;
}

// Función para verificar si hay un token válido en localStorage
const checkInitialAuth = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Intentar decodificar el token para verificar si es válido
    const decoded = jwtDecode(token) as JwtPayload;
    // Verificar si el token ha expirado
    if (decoded.exp * 1000 < Date.now()) {
      console.log('Token inicial expirado, limpiando localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error al verificar token inicial:', e);
    return false;
  }
};

// Cargar usuario inicial desde localStorage
const loadInitialUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
  } catch (e) {
    console.error('Error al cargar usuario inicial:', e);
  }
  return null;
};

// Función para determinar el tipo de operación basado en el turno del usuario
const getOperationType = (user: User | null): 'agente' | 'super' | null => {
  if (!user?.turno) return null;
  if (user.turno.agente) return 'agente';
  if (user.turno.super) return 'super';
  return null;
};

const initialUser = loadInitialUser();
const initialState: AuthState = {
  isAuthenticated: checkInitialAuth(),
  user: initialUser,
  permissions: {},
  loading: true,
  operationType: getOperationType(initialUser)
};

const AuthContext = createContext<AuthContextType>({
  state: initialState,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasRole: () => false,
  isOperationType: () => false,
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  // Función para cargar permisos del token
  const loadPermissionsFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('Verificando autenticación...', { tokenExists: !!token, userExists: !!userStr });
      
      if (token) {
        console.log('Decodificando token JWT...');
        // Decodificar el token JWT
        const decoded = jwtDecode(token) as JwtPayload;
        console.log('Token decodificado:', decoded);
        
        // Verificar si el token ha expirado
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expirado, haciendo logout');
          // Token expirado, hacer logout
          handleLogout();
          return;
        }
        
        // Convertir array de permisos a un mapa para fácil verificación
        const permissionsMap: Record<string, boolean> = {};
        if (decoded.permissions && Array.isArray(decoded.permissions)) {
          decoded.permissions.forEach((code: string) => {
            permissionsMap[code] = true;
          });
          console.log('Permisos cargados:', Object.keys(permissionsMap));
        } else {
          console.warn('No se encontraron permisos en el token o no es un array');
        }
        
        // Cargar datos del usuario desde localStorage si existen
        let user: User | null = null;
        try {
          if (userStr) {
            user = JSON.parse(userStr) as User;
            console.log('Usuario cargado desde localStorage:', user);
          }
        } catch (e) {
          console.error('Error al parsear datos de usuario:', e);
        }
        
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: user || prev.user,
          permissions: permissionsMap,
          loading: false,
        }));
      } else {
        console.log('No hay token JWT disponible');
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false,
          user: null,
          permissions: {},
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Error al decodificar token:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        isAuthenticated: false 
      }));
    }
  };
  
  // Cargar permisos del token al iniciar y cuando cambie el token
  useEffect(() => {
    console.log('AuthContext - Efecto de inicialización ejecutado');
    
    // Forzar una verificación inmediata del token
    const checkAuth = async () => {
      console.log('Verificando autenticación inicial...');
      
      // Verificar si hay token en localStorage
      const token = localStorage.getItem('token');
      console.log('Token en localStorage:', token ? 'Presente' : 'Ausente');
      
      if (!token) {
        console.log('No hay token en localStorage, estableciendo estado no autenticado');
        setState({
          isAuthenticated: false,
          user: null,
          permissions: {},
          loading: false
        });
        return;
      }
      
      // Verificar si el token es válido imprimiendo los primeros caracteres
      console.log('Token encontrado en localStorage:', token.substring(0, 20) + '...');
      
      try {
        // Decodificar el token JWT
        console.log('Decodificando token JWT inicial...');
        const decoded = jwtDecode(token) as JwtPayload;
        
        // Verificar si el token ha expirado
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token inicial expirado, limpiando localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState({
            isAuthenticated: false,
            user: null,
            permissions: {},
            loading: false
          });
          return;
        }
        
        // Convertir array de permisos a un mapa
        const permissionsMap: Record<string, boolean> = {};
        if (decoded.permissions && Array.isArray(decoded.permissions)) {
          decoded.permissions.forEach((code: string) => {
            permissionsMap[code] = true;
          });
          console.log('Permisos iniciales cargados:', Object.keys(permissionsMap));
        }
        
        // Cargar datos del usuario
        let user = null;
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            user = JSON.parse(userStr) as User;
            console.log('Usuario inicial cargado:', user);
          } catch (e) {
            console.error('Error al parsear usuario:', e);
          }
        }
        
        // Actualizar estado completo
        setState({
          isAuthenticated: true,
          user: user,
          permissions: permissionsMap,
          loading: false,
        });
        
        console.log('Estado de autenticación inicial establecido:', { isAuthenticated: true });
      } catch (error) {
        console.error('Error al verificar token inicial:', error);
        setState({
          isAuthenticated: false,
          user: null,
          permissions: {},
          loading: false
        });
      }
    };
    
    // Ejecutar verificación inmediata
    checkAuth();
    
    // Comprobar la validez del token periódicamente (cada minuto)
    const tokenCheckInterval = setInterval(loadPermissionsFromToken, 60000);
    
    // Agregar listener para cambios en localStorage (para sincronizar entre pestañas)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === 'user') {
        console.log('Cambio detectado en localStorage:', event.key);
        loadPermissionsFromToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(tokenCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      console.log('Iniciando sesión para usuario:', username);
      const response = await authApi.login({ username, password });
      console.log('Respuesta de login recibida:', response);
      
      if (!response || !response.access_token) {
        throw new Error('Respuesta de login inválida: no se recibió token');
      }
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Decodificar el token para obtener permisos
      try {
        console.log('Decodificando token JWT en handleLogin...');
        const decoded = jwtDecode(response.access_token) as JwtPayload;
        
        // Convertir array de permisos a un mapa para fácil verificación
        const permissionsMap: Record<string, boolean> = {};
        if (decoded.permissions && Array.isArray(decoded.permissions)) {
          decoded.permissions.forEach((code: string) => {
            permissionsMap[code] = true;
          });
          console.log('Permisos cargados en handleLogin:', Object.keys(permissionsMap));
        }
        
        // Actualizar estado completo con toda la información
        setState({
          isAuthenticated: true,
          user: response.user,
          permissions: permissionsMap,
          loading: false,
        });
        
        console.log('Estado de autenticación actualizado completamente');
        
        // Redirigir según el rol del usuario
        if (response.user?.rol?.nombre === 'VendedorB' || response.user?.rol?.nombre === 'Vendedor') {
          console.log(`Usuario ${response.user.rol.nombre} detectado, redirigiendo a /turnos/vendedor`);
          navigate('/turnos/vendedor');
        } else {
          console.log('Usuario no es Vendedor/VendedorB, redirigiendo al dashboard');
          navigate('/dashboard');
        }
      } catch (decodeError) {
        console.error('Error al decodificar token en handleLogin:', decodeError);
        
        // Si hay error al decodificar, al menos actualizar el estado básico
        setState({
          isAuthenticated: true,
          user: response.user,
          permissions: {},
          loading: false,
        });
        
        // Redirigir según el rol del usuario (incluso si hay error al decodificar)
        if (response.user?.rol?.nombre === 'VendedorB' || response.user?.rol?.nombre === 'Vendedor') {
          console.log(`Usuario ${response.user.rol.nombre} detectado (fallback), redirigiendo a /turnos/vendedor`);
          navigate('/turnos/vendedor');
        } else {
          console.log('Usuario no es Vendedor/VendedorB (fallback), redirigiendo al dashboard');
          navigate('/dashboard');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    // Eliminar datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    
    // Resetear estado
    setState({
      isAuthenticated: false,
      user: null,
      permissions: {},
      loading: false,
    });
    
    // Redirigir a login
    navigate('/login');
  };

  const hasPermission = (permissionCode: string): boolean => {
    return !!state.permissions[permissionCode];
  };

  const hasRole = (roleName: string): boolean => {
    if (!state.user || !state.user.rol) return false;
    return state.user.rol.nombre.toLowerCase() === roleName.toLowerCase();
  };

  // Función para verificar el tipo de operación actual
  const isOperationType = (type: 'agente' | 'super'): boolean => {
    if (!state.user?.turno) return false;
    return type === 'agente' ? state.user.turno.agente : state.user.turno.super;
  };

  // Efecto para actualizar el tipo de operación cuando cambia el usuario
  useEffect(() => {
    if (state.user?.turno) {
      const newOperationType = getOperationType(state.user);
      if (newOperationType !== state.operationType) {
        setState(prev => ({
          ...prev,
          operationType: newOperationType
        }));
      }
    }
  }, [state.user?.turno]);

  return (
    <AuthContext.Provider value={{
      state,
      login: handleLogin,
      logout: handleLogout,
      hasPermission,
      hasRole,
      isOperationType
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

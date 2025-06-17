import api from '../api';
import { useQuery } from '@tanstack/react-query';

// Interfaces
export interface Permiso {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
  codigo: string;
}

export interface PermissionsMap {
  [key: string]: boolean;
}

// API calls
export const getUserPermissions = async (): Promise<Permiso[]> => {
  const response = await api.get('/user-permissions/me');
  return response.data;
};

export const getUserPermissionsMap = async (): Promise<PermissionsMap> => {
  try {
    const response = await api.get('/user-permissions/me/map');
    console.log('Permisos obtenidos del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos del usuario:', error);
    throw error;
  }
};

export const checkPermission = async (permisoCode: string): Promise<boolean> => {
  const response = await api.get(`/user-permissions/check/${permisoCode}`);
  return response.data.hasPermission;
};

// React Query hooks
export const useUserPermissions = () => {
  return useQuery({
    queryKey: ['userPermissions'],
    queryFn: getUserPermissions,
  });
};

export const useUserPermissionsMap = () => {
  return useQuery({
    queryKey: ['userPermissionsMap'],
    queryFn: getUserPermissionsMap,
  });
};

// Mock data for testing
// Desactivamos los datos mock para usar los datos reales del backend
const USE_MOCK = false;
const MOCK_PERMISSIONS: Permiso[] = [
  // Dashboard
  { id: 1, nombre: 'Ver Dashboard Vendedor', descripcion: 'Permite ver el dashboard del vendedor', modulo: 'Dashboard', codigo: 'ver_dashboard_vendedor' },
  
  // Transacciones
  { id: 2, nombre: 'Ver Transacciones', descripcion: 'Permite ver las transacciones', modulo: 'Transacciones', codigo: 'ver_transacciones' },
  { id: 3, nombre: 'Ver Tipos de Transacción', descripcion: 'Permite ver los tipos de transacción', modulo: 'Transacciones', codigo: 'ver_tipos_transaccion' },
  { id: 4, nombre: 'Ver Cierres de Agentes', descripcion: 'Permite ver los cierres de agentes', modulo: 'Transacciones', codigo: 'ver_cierres_agentes' },
  
  // Reportes
  { id: 5, nombre: 'Ver Reportes', descripcion: 'Permite ver los reportes', modulo: 'Reportes', codigo: 'ver_reportes' },
  
  // Administración
  { id: 6, nombre: 'Ver Roles', descripcion: 'Permite ver los roles', modulo: 'Administración', codigo: 'ver_roles' },
  { id: 7, nombre: 'Ver Usuarios', descripcion: 'Permite ver los usuarios', modulo: 'Administración', codigo: 'ver_usuarios' },
  { id: 8, nombre: 'Ver Turnos', descripcion: 'Permite ver los turnos', modulo: 'Administración', codigo: 'ver_turnos' },
  
  // Proveedores
  { id: 9, nombre: 'Ver Tipos de Proveedor', descripcion: 'Permite ver los tipos de proveedor', modulo: 'Proveedores', codigo: 'ver_tipos_proveedor' },
  { id: 10, nombre: 'Ver Proveedores', descripcion: 'Permite ver los proveedores', modulo: 'Proveedores', codigo: 'ver_proveedores' },
  
  // Ventas
  { id: 11, nombre: 'Ver Ventas', descripcion: 'Permite ver las ventas', modulo: 'Ventas', codigo: 'ver_ventas' },
  { id: 12, nombre: 'Crear Ventas', descripcion: 'Permite crear ventas', modulo: 'Ventas', codigo: 'crear_ventas' },
  { id: 13, nombre: 'Editar Ventas', descripcion: 'Permite editar ventas', modulo: 'Ventas', codigo: 'editar_ventas' },
  
  // Clientes
  { id: 14, nombre: 'Ver Clientes', descripcion: 'Permite ver los clientes', modulo: 'Clientes', codigo: 'ver_clientes' },
  { id: 15, nombre: 'Crear Clientes', descripcion: 'Permite crear clientes', modulo: 'Clientes', codigo: 'crear_clientes' },
  { id: 16, nombre: 'Editar Clientes', descripcion: 'Permite editar clientes', modulo: 'Clientes', codigo: 'editar_clientes' },
  
  // Productos
  { id: 17, nombre: 'Ver Productos', descripcion: 'Permite ver los productos', modulo: 'Productos', codigo: 'ver_productos' },
];

const MOCK_PERMISSIONS_MAP: PermissionsMap = {
  // Solo asignamos los permisos del rol de Vendedor
  ver_dashboard_vendedor: true,
  ver_ventas: true,
  crear_ventas: true,
  editar_ventas: true,
  ver_clientes: true,
  crear_clientes: true,
  editar_clientes: true,
  ver_productos: true,
  
  // Los permisos de administrador no están disponibles para el rol de Vendedor
  ver_transacciones: false,
  ver_tipos_transaccion: false,
  ver_cierres_agentes: false,
  ver_reportes: false,
  ver_roles: false,
  ver_usuarios: false,
  ver_turnos: false,
  ver_tipos_proveedor: false,
  ver_proveedores: false,
};

// Exportar funciones mock si es necesario
export const mockUserPermissions = {
  getUserPermissions: async (): Promise<Permiso[]> => MOCK_PERMISSIONS,
  getUserPermissionsMap: async (): Promise<PermissionsMap> => MOCK_PERMISSIONS_MAP,
  checkPermission: async (permisoCode: string): Promise<boolean> => 
    MOCK_PERMISSIONS_MAP[permisoCode] || false,
};

// Exportar las funciones correctas según la configuración
export default USE_MOCK ? mockUserPermissions : {
  getUserPermissions,
  getUserPermissionsMap,
  checkPermission,
};

import api from '../api';

// Interfaces
export interface Permiso {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  modulo: string;
  activo: boolean;
}

export interface PermisoRol {
  id: number;
  rol_id: number;
  permiso_id: number;
  permiso?: Permiso;
}

export interface AsignarPermisosDto {
  rolId: number;
  permisosIds: number[];
}

// Mock data para permisos mientras se implementa el backend
const mockPermisos: Permiso[] = [
  // Módulo de Usuarios
  { id: 1, nombre: 'Ver Usuarios', codigo: 'USERS_VIEW', descripcion: 'Permite ver la lista de usuarios', modulo: 'Usuarios', activo: true },
  { id: 2, nombre: 'Crear Usuarios', codigo: 'USERS_CREATE', descripcion: 'Permite crear nuevos usuarios', modulo: 'Usuarios', activo: true },
  { id: 3, nombre: 'Editar Usuarios', codigo: 'USERS_EDIT', descripcion: 'Permite modificar usuarios existentes', modulo: 'Usuarios', activo: true },
  { id: 4, nombre: 'Eliminar Usuarios', codigo: 'USERS_DELETE', descripcion: 'Permite eliminar usuarios', modulo: 'Usuarios', activo: true },
  
  // Módulo de Turnos
  { id: 5, nombre: 'Ver Turnos', codigo: 'TURNOS_VIEW', descripcion: 'Permite ver la lista de turnos', modulo: 'Turnos', activo: true },
  { id: 6, nombre: 'Crear Turnos', codigo: 'TURNOS_CREATE', descripcion: 'Permite crear nuevos turnos', modulo: 'Turnos', activo: true },
  { id: 7, nombre: 'Editar Turnos', codigo: 'TURNOS_EDIT', descripcion: 'Permite modificar turnos existentes', modulo: 'Turnos', activo: true },
  { id: 8, nombre: 'Eliminar Turnos', codigo: 'TURNOS_DELETE', descripcion: 'Permite eliminar turnos', modulo: 'Turnos', activo: true },
  
  // Módulo de Roles y Permisos
  { id: 9, nombre: 'Ver Roles', codigo: 'ROLES_VIEW', descripcion: 'Permite ver la lista de roles', modulo: 'Roles', activo: true },
  { id: 10, nombre: 'Gestionar Roles', codigo: 'ROLES_MANAGE', descripcion: 'Permite crear, editar y eliminar roles', modulo: 'Roles', activo: true },
  { id: 11, nombre: 'Asignar Permisos', codigo: 'PERMISOS_ASSIGN', descripcion: 'Permite asignar permisos a roles', modulo: 'Permisos', activo: true },
  
  // Módulo de Reportes
  { id: 12, nombre: 'Ver Reportes', codigo: 'REPORTS_VIEW', descripcion: 'Permite ver reportes', modulo: 'Reportes', activo: true },
  { id: 13, nombre: 'Exportar Reportes', codigo: 'REPORTS_EXPORT', descripcion: 'Permite exportar reportes a PDF', modulo: 'Reportes', activo: true },
  
  // Módulo de Transacciones
  { id: 14, nombre: 'Ver Transacciones', codigo: 'TRANSACTIONS_VIEW', descripcion: 'Permite ver la lista de transacciones', modulo: 'Transacciones', activo: true },
  { id: 15, nombre: 'Crear Transacciones', codigo: 'TRANSACTIONS_CREATE', descripcion: 'Permite crear nuevas transacciones', modulo: 'Transacciones', activo: true },
  { id: 16, nombre: 'Editar Transacciones', codigo: 'TRANSACTIONS_EDIT', descripcion: 'Permite modificar transacciones existentes', modulo: 'Transacciones', activo: true },
  { id: 17, nombre: 'Eliminar Transacciones', codigo: 'TRANSACTIONS_DELETE', descripcion: 'Permite eliminar transacciones', modulo: 'Transacciones', activo: true },
  { id: 18, nombre: 'Ver Detalle de Transacciones', codigo: 'TRANSACTIONS_DETAIL', descripcion: 'Permite ver el detalle completo de las transacciones', modulo: 'Transacciones', activo: true },
  { id: 19, nombre: 'Ver Resumen de Transacciones', codigo: 'TRANSACTIONS_SUMMARY', descripcion: 'Permite ver el resumen de transacciones', modulo: 'Transacciones', activo: true },
  
  // Módulo de Tipos de Transacción
  { id: 20, nombre: 'Ver Tipos de Transacción', codigo: 'TRANSACTION_TYPES_VIEW', descripcion: 'Permite ver la lista de tipos de transacción', modulo: 'Tipos de Transacción', activo: true },
  { id: 21, nombre: 'Gestionar Tipos de Transacción', codigo: 'TRANSACTION_TYPES_MANAGE', descripcion: 'Permite crear, editar y eliminar tipos de transacción', modulo: 'Tipos de Transacción', activo: true },
  
  // Módulo de Cierre Final de Agentes
  { id: 22, nombre: 'Ver Cierres de Agentes', codigo: 'AGENT_CLOSINGS_VIEW', descripcion: 'Permite ver la lista de cierres de agentes', modulo: 'Cierre de Agentes', activo: true },
  { id: 23, nombre: 'Crear Cierres de Agentes', codigo: 'AGENT_CLOSINGS_CREATE', descripcion: 'Permite crear nuevos cierres de agentes', modulo: 'Cierre de Agentes', activo: true },
  { id: 24, nombre: 'Editar Cierres de Agentes', codigo: 'AGENT_CLOSINGS_EDIT', descripcion: 'Permite modificar cierres de agentes existentes', modulo: 'Cierre de Agentes', activo: true },
  { id: 25, nombre: 'Eliminar Cierres de Agentes', codigo: 'AGENT_CLOSINGS_DELETE', descripcion: 'Permite eliminar cierres de agentes', modulo: 'Cierre de Agentes', activo: true },
  
  // Módulo de Proveedores
  { id: 26, nombre: 'Ver Proveedores', codigo: 'PROVIDERS_VIEW', descripcion: 'Permite ver la lista de proveedores', modulo: 'Proveedores', activo: true },
  { id: 27, nombre: 'Gestionar Proveedores', codigo: 'PROVIDERS_MANAGE', descripcion: 'Permite crear, editar y eliminar proveedores', modulo: 'Proveedores', activo: true },
  
  // Módulo de Tipos de Proveedor
  { id: 28, nombre: 'Ver Tipos de Proveedor', codigo: 'PROVIDER_TYPES_VIEW', descripcion: 'Permite ver la lista de tipos de proveedor', modulo: 'Tipos de Proveedor', activo: true },
  { id: 29, nombre: 'Gestionar Tipos de Proveedor', codigo: 'PROVIDER_TYPES_MANAGE', descripcion: 'Permite crear, editar y eliminar tipos de proveedor', modulo: 'Tipos de Proveedor', activo: true },
];

// Mock data para permisos de roles
const mockPermisosRoles: PermisoRol[] = [
  // Administrador tiene todos los permisos
  // Permisos de Usuarios
  { id: 1, rol_id: 1, permiso_id: 1 },
  { id: 2, rol_id: 1, permiso_id: 2 },
  { id: 3, rol_id: 1, permiso_id: 3 },
  { id: 4, rol_id: 1, permiso_id: 4 },
  // Permisos de Turnos
  { id: 5, rol_id: 1, permiso_id: 5 },
  { id: 6, rol_id: 1, permiso_id: 6 },
  { id: 7, rol_id: 1, permiso_id: 7 },
  { id: 8, rol_id: 1, permiso_id: 8 },
  // Permisos de Roles y Permisos
  { id: 9, rol_id: 1, permiso_id: 9 },
  { id: 10, rol_id: 1, permiso_id: 10 },
  { id: 11, rol_id: 1, permiso_id: 11 },
  // Permisos de Reportes
  { id: 12, rol_id: 1, permiso_id: 12 },
  { id: 13, rol_id: 1, permiso_id: 13 },
  // Permisos de Transacciones
  { id: 14, rol_id: 1, permiso_id: 14 },
  { id: 15, rol_id: 1, permiso_id: 15 },
  { id: 16, rol_id: 1, permiso_id: 16 },
  { id: 17, rol_id: 1, permiso_id: 17 },
  { id: 18, rol_id: 1, permiso_id: 18 },
  { id: 19, rol_id: 1, permiso_id: 19 },
  // Permisos de Tipos de Transacción
  { id: 20, rol_id: 1, permiso_id: 20 },
  { id: 21, rol_id: 1, permiso_id: 21 },
  // Permisos de Cierre de Agentes
  { id: 22, rol_id: 1, permiso_id: 22 },
  { id: 23, rol_id: 1, permiso_id: 23 },
  { id: 24, rol_id: 1, permiso_id: 24 },
  { id: 25, rol_id: 1, permiso_id: 25 },
  // Permisos de Proveedores
  { id: 26, rol_id: 1, permiso_id: 26 },
  { id: 27, rol_id: 1, permiso_id: 27 },
  // Permisos de Tipos de Proveedor
  { id: 28, rol_id: 1, permiso_id: 28 },
  { id: 29, rol_id: 1, permiso_id: 29 },
  
  // Supervisor solo tiene permisos de vista y reportes
  { id: 30, rol_id: 2, permiso_id: 1 },  // Ver Usuarios
  { id: 31, rol_id: 2, permiso_id: 5 },  // Ver Turnos
  { id: 32, rol_id: 2, permiso_id: 9 },  // Ver Roles
  { id: 33, rol_id: 2, permiso_id: 12 }, // Ver Reportes
  { id: 34, rol_id: 2, permiso_id: 13 }, // Exportar Reportes
  { id: 35, rol_id: 2, permiso_id: 14 }, // Ver Transacciones
  { id: 36, rol_id: 2, permiso_id: 18 }, // Ver Detalle de Transacciones
  { id: 37, rol_id: 2, permiso_id: 19 }, // Ver Resumen de Transacciones
  { id: 38, rol_id: 2, permiso_id: 20 }, // Ver Tipos de Transacción
  { id: 39, rol_id: 2, permiso_id: 22 }, // Ver Cierres de Agentes
  { id: 40, rol_id: 2, permiso_id: 26 }, // Ver Proveedores
  { id: 41, rol_id: 2, permiso_id: 28 }, // Ver Tipos de Proveedor
  
  // Operador tiene permisos básicos
  { id: 42, rol_id: 3, permiso_id: 1 },  // Ver Usuarios
  { id: 43, rol_id: 3, permiso_id: 5 },  // Ver Turnos
  { id: 44, rol_id: 3, permiso_id: 6 },  // Crear Turnos
  { id: 45, rol_id: 3, permiso_id: 7 },  // Editar Turnos
  { id: 46, rol_id: 3, permiso_id: 14 }, // Ver Transacciones
  { id: 47, rol_id: 3, permiso_id: 15 }, // Crear Transacciones
  { id: 48, rol_id: 3, permiso_id: 22 }, // Ver Cierres de Agentes
];

// Bandera para usar mock o API real
const USE_MOCK = false; // Usando datos mock temporalmente mientras el backend no está disponible

const permisosApi = {
  // Obtener todos los permisos
  getAll: async (): Promise<Permiso[]> => {
    if (USE_MOCK) {
      return Promise.resolve([...mockPermisos]);
    }
    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const response = await api.get(`/permisos?_t=${timestamp}`);
    console.log('Permisos obtenidos del backend:', response.data);
    return response.data;
  },

  // Obtener permisos por módulo
  getByModulo: async (modulo: string): Promise<Permiso[]> => {
    if (USE_MOCK) {
      return Promise.resolve(mockPermisos.filter(p => p.modulo === modulo));
    }
    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const response = await api.get(`/permisos/modulo/${modulo}?_t=${timestamp}`);
    console.log(`Permisos del módulo ${modulo} obtenidos del backend:`, response.data);
    return response.data;
  },

  // Obtener permisos por rol
  getByRol: async (rolId: number): Promise<Permiso[]> => {
    if (USE_MOCK) {
      const permisosIds = mockPermisosRoles
        .filter(pr => pr.rol_id === rolId)
        .map(pr => pr.permiso_id);
      return Promise.resolve(mockPermisos.filter(p => permisosIds.includes(p.id)));
    }
    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const response = await api.get(`/permisos/roles/${rolId}?_t=${timestamp}`);
    console.log(`Permisos del rol ${rolId} obtenidos del backend:`, response.data);
    return response.data;
  },

  // Asignar permisos a un rol
  asignarPermisos: async (data: AsignarPermisosDto): Promise<void> => {
    if (USE_MOCK) {
      // Eliminar permisos existentes para este rol
      const rolId = data.rolId;
      const permisosIdsToKeep = mockPermisosRoles
        .filter(pr => pr.rol_id !== rolId)
        .map(pr => pr.id);
      
      // Crear nuevos registros para los permisos asignados
      let nextId = Math.max(...mockPermisosRoles.map(pr => pr.id)) + 1;
      
      // Filtrar mockPermisosRoles para mantener solo los que no son del rol actual
      const filteredPermisosRoles = mockPermisosRoles.filter(pr => pr.rol_id !== rolId);
      
      // Agregar los nuevos permisos para este rol
      data.permisosIds.forEach((permisoId: number) => {
        filteredPermisosRoles.push({
          id: nextId++,
          rol_id: rolId,
          permiso_id: permisoId
        });
      });
      
      // Actualizar mockPermisosRoles
      mockPermisosRoles.length = 0;
      mockPermisosRoles.push(...filteredPermisosRoles);
      
      return Promise.resolve();
    }
    await api.post('/permisos/roles', data);
  }
};

export default permisosApi;

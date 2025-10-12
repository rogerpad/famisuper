import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RolesPermisos from '../pages/roles/RolesPermisos';
import PermissionsList from '../components/auth/PermissionsList';

const rolesRoutes: RouteObject[] = [
  {
    path: '/roles',
    element: (
      <ProtectedRoute requiredPermission="ver_roles">
        <RolesPermisos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/permissions',
    element: (
      <ProtectedRoute requiredPermission="admin_permisos">
        <PermissionsList />
      </ProtectedRoute>
    ),
  },
];

export default rolesRoutes;

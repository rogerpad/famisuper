import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import UsersList from '../pages/users/UsersList';

const usersRoutes: RouteObject[] = [
  {
    path: '/users',
    element: (
      <ProtectedRoute requiredPermission="ver_usuarios">
        <UsersList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/clientes',
    element: (
      <ProtectedRoute requiredPermission="ver_clientes">
        <UsersList />
      </ProtectedRoute>
    ),
  },
];

export default usersRoutes;

import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { SuperClosingsList, SuperClosingForm, SuperClosingDetail } from '../components/super-closings';

const superClosingsRoutes: RouteObject[] = [
  {
    path: '/cierres-super',
    element: (
      <ProtectedRoute requiredPermission="ver_cierre_super">
        <SuperClosingsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cierres-super/new',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_cierre_super">
        <SuperClosingForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cierres-super/:id',
    element: (
      <ProtectedRoute requiredPermission="ver_cierre_super">
        <SuperClosingDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cierres-super/:id/edit',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_cierre_super">
        <SuperClosingForm />
      </ProtectedRoute>
    ),
  },
];

export default superClosingsRoutes;

import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { CierresSuperList, CierreSuperForm, CierreSuperDetail } from '../components/cierres-super';

const cierresSuperRoutes: RouteObject[] = [
  {
    path: '/cierres-super',
    element: (
      <ProtectedRoute requiredPermission="ver_cierre_super">
        <CierresSuperList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cierres-super/new',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_cierre_super">
        <CierreSuperForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cierres-super/:id',
    element: (
      <ProtectedRoute requiredPermission="ver_cierre_super">
        <CierreSuperDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cierres-super/:id/edit',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_cierre_super">
        <CierreSuperForm />
      </ProtectedRoute>
    ),
  },
];

export default cierresSuperRoutes;

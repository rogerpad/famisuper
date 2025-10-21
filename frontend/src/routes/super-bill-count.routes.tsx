import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import SuperBillCountPage from '../pages/super-bill-count/SuperBillCountPage';
import { SuperBillCountForm, SuperBillCountDetail } from '../components/super-bill-count';

const superBillCountRoutes: RouteObject[] = [
  {
    path: '/conteo-billetes-super',
    element: (
      <ProtectedRoute requiredPermission="ver_conteo_super">
        <SuperBillCountPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/conteo-billetes-super/new',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_conteo_super">
        <SuperBillCountForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/conteo-billetes-super/edit/:id',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_conteo_super">
        <SuperBillCountForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/conteo-billetes-super/view/:id',
    element: (
      <ProtectedRoute requiredPermission="ver_conteo_super">
        <SuperBillCountDetail />
      </ProtectedRoute>
    ),
  },
];

export default superBillCountRoutes;

import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import ConteoBilletesSuperPage from '../pages/conteo-billetes-super/ConteoBilletesSuperPage';
import { ConteoBilletesSuperForm, ConteoBilletesSuperDetail } from '../components/conteo-billetes-super';

const conteoBilletesSuperRoutes: RouteObject[] = [
  {
    path: '/conteo-billetes-super',
    element: (
      <ProtectedRoute requiredPermission="ver_conteo_super">
        <ConteoBilletesSuperPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/conteo-billetes-super/new',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_conteo_super">
        <ConteoBilletesSuperForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/conteo-billetes-super/edit/:id',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_conteo_super">
        <ConteoBilletesSuperForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/conteo-billetes-super/view/:id',
    element: (
      <ProtectedRoute requiredPermission="ver_conteo_super">
        <ConteoBilletesSuperDetail />
      </ProtectedRoute>
    ),
  },
];

export default conteoBilletesSuperRoutes;

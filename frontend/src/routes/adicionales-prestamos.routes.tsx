import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdicionalesPrestamosPage from '../pages/adicionales-prestamos/AdicionalesPrestamosPage';
import AdicionalesPrestamosFormPage from '../pages/adicionales-prestamos/AdicionalesPrestamosFormPage';
import AdicionalesPrestamosDetallePage from '../pages/adicionales-prestamos/AdicionalesPrestamosDetallePage';

const adicionalesPrestamosRoutes: RouteObject[] = [
  {
    path: '/adicionales-prestamos',
    element: (
      <ProtectedRoute requiredPermission="ver_adic_presta">
        <AdicionalesPrestamosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/adicionales-prestamos/nuevo',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_adic_prest">
        <AdicionalesPrestamosFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/adicionales-prestamos/editar/:id',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_adic_prest">
        <AdicionalesPrestamosFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/adicionales-prestamos/detalle/:id',
    element: (
      <ProtectedRoute requiredPermission="ver_adic_presta">
        <AdicionalesPrestamosDetallePage />
      </ProtectedRoute>
    ),
  },
];

export default adicionalesPrestamosRoutes;

import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdditionalLoanPage from '../pages/additional-loan/AdditionalLoanPage';
import AdditionalLoanFormPage from '../pages/additional-loan/AdditionalLoanFormPage';
import AdditionalLoanDetailPage from '../pages/additional-loan/AdditionalLoanDetailPage';

const additionalLoanRoutes: RouteObject[] = [
  {
    path: '/adicionales-prestamos',
    element: (
      <ProtectedRoute requiredPermission="ver_adic_presta">
        <AdditionalLoanPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/adicionales-prestamos/nuevo',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_adic_prest">
        <AdditionalLoanFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/adicionales-prestamos/editar/:id',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_adic_prest">
        <AdditionalLoanFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/adicionales-prestamos/detalle/:id',
    element: (
      <ProtectedRoute requiredPermission="ver_adic_presta">
        <AdditionalLoanDetailPage />
      </ProtectedRoute>
    ),
  },
];

export default additionalLoanRoutes;

import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import ProviderTypesList from '../pages/provider-types/ProviderTypesList';
import ProvidersList from '../pages/providers/ProvidersList';
import FormulaConfigForm from '../pages/formula-configs/FormulaConfigForm';

const providersRoutes: RouteObject[] = [
  {
    path: '/provider-types',
    element: (
      <ProtectedRoute requiredPermission="ver_tipos_proveedor">
        <ProviderTypesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/providers',
    element: (
      <ProtectedRoute requiredPermission="ver_proveedores">
        <ProvidersList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/productos',
    element: (
      <ProtectedRoute requiredPermission="ver_productos">
        <ProvidersList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/formula-configs/:providerId',
    element: (
      <ProtectedRoute requiredPermission="ver_proveedores">
        <FormulaConfigForm />
      </ProtectedRoute>
    ),
  },
];

export default providersRoutes;

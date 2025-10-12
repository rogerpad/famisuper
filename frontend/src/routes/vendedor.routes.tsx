import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import VendedorDashboard from '../pages/vendedor/VendedorDashboard';
import TransactionsList from '../pages/transactions/TransactionsList';

const vendedorRoutes: RouteObject[] = [
  {
    path: '/vendedor',
    element: (
      <ProtectedRoute requiredPermission="ver_dashboard_vendedor">
        <VendedorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ventas',
    element: (
      <ProtectedRoute requiredPermission="ver_ventas">
        <TransactionsList />
      </ProtectedRoute>
    ),
  },
];

export default vendedorRoutes;

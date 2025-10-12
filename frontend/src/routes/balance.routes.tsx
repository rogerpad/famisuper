import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import BalanceFlowsList from '../components/balance-flows/BalanceFlowsList';
import BalanceSalesList from '../components/balance-sales/BalanceSalesList';
import BalanceSaleForm from '../components/balance-sales/BalanceSaleForm';

const balanceRoutes: RouteObject[] = [
  // Flujos de Saldo
  {
    path: '/balance-flows',
    element: (
      <ProtectedRoute requiredPermission="ver_flujos_saldo">
        <BalanceFlowsList />
      </ProtectedRoute>
    ),
  },
  // Ventas de Saldo
  {
    path: '/balance-sales',
    element: (
      <ProtectedRoute requiredPermission="ver_venta_paquete">
        <BalanceSalesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/balance-sales/new',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_venta">
        <BalanceSaleForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/balance-sales/edit/:id',
    element: (
      <ProtectedRoute requiredPermission="crear_editar_venta">
        <BalanceSaleForm />
      </ProtectedRoute>
    ),
  },
];

export default balanceRoutes;

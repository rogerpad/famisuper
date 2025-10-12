import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import TransactionsList from '../pages/transactions/TransactionsList';
import TransactionDetail from '../pages/transactions/TransactionDetail';
import TransactionTypesList from '../pages/transaction-types/TransactionTypesList';

const transactionsRoutes: RouteObject[] = [
  {
    path: '/transactions',
    element: (
      <ProtectedRoute requiredPermission="ver_transacciones">
        <TransactionsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/transactions/:id',
    element: (
      <ProtectedRoute requiredPermission="ver_transacciones">
        <TransactionDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/transaction-types',
    element: (
      <ProtectedRoute requiredPermission="ver_tipos_transaccion">
        <TransactionTypesList />
      </ProtectedRoute>
    ),
  },
];

export default transactionsRoutes;

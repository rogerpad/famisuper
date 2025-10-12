import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CashCounterPage from '../pages/cash-count/CashCounterPage';
import CashCountHistoryPage from '../pages/cash-count/CashCountHistoryPage';

const cashCountRoutes: RouteObject[] = [
  {
    path: '/cash-counter',
    element: (
      <ProtectedRoute requiredPermission="ver_contador_efectivo">
        <CashCounterPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cash-history',
    element: (
      <ProtectedRoute requiredPermission="ver_contador_efectivo">
        <CashCountHistoryPage />
      </ProtectedRoute>
    ),
  },
];

export default cashCountRoutes;

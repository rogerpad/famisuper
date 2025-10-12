import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Reports from '../pages/reports/Reports';

const reportsRoutes: RouteObject[] = [
  {
    path: '/reports',
    element: (
      <ProtectedRoute requiredPermission="ver_reportes">
        <Reports />
      </ProtectedRoute>
    ),
  },
];

export default reportsRoutes;

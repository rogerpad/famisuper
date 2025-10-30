import React from 'react';
import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy loading de páginas de reportes
const Reports = React.lazy(() => import('../pages/reports/Reports'));
const TransactionSummaryReport = React.lazy(() => import('../pages/reports/TransactionSummaryReport'));
const SuperReportsPage = React.lazy(() => import('../pages/reports/SuperReportsPage'));
const AgentReportsPage = React.lazy(() => import('../pages/reports/AgentReportsPage'));

export const reportsRoutes: RouteObject[] = [
  {
    path: 'reports',
    element: (
      <ProtectedRoute requiredPermission="ver_reportes">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Reports />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'reports/transactions-summary',
    element: (
      <ProtectedRoute requiredPermission="ver_reportes">
        <React.Suspense fallback={<div>Loading...</div>}>
          <TransactionSummaryReport />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'reports/super',
    element: (
      <ProtectedRoute requiredPermission="ver_reportes">
        <React.Suspense fallback={<div>Loading...</div>}>
          <SuperReportsPage />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: 'reports/agent',
    element: (
      <ProtectedRoute requiredPermission="ver_reportes">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AgentReportsPage />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
];

export default reportsRoutes;

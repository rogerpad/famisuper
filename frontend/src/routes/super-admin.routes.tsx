import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import SuperExpenseTypesList from '../components/super-expense-types/SuperExpenseTypesList';
import SuperExpensesList from '../components/super-expenses/SuperExpensesList';
import PaymentDocumentsList from '../components/payment-documents/PaymentDocumentsList';
import PaymentMethodsList from '../components/payment-methods/PaymentMethodsList';
import PhoneLinesList from '../components/phoneLines/PhoneLinesList';
import PackagesList from '../components/packages/PackagesList';
import PackageForm from '../components/packages/PackageForm';

const superAdminRoutes: RouteObject[] = [
  // Egresos Super
  {
    path: '/super-expenses',
    element: (
      <ProtectedRoute requiredPermission="ver_egresos_super">
        <SuperExpensesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/super-expense-types',
    element: (
      <ProtectedRoute requiredPermission="ver_tipos_egresos_super">
        <SuperExpenseTypesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin-tipos-egresos',
    element: (
      <ProtectedRoute requiredPermission="admin_tipos_egresos_super">
        <SuperExpenseTypesList />
      </ProtectedRoute>
    ),
  },
  // Documentos y Formas de Pago
  {
    path: '/payment-documents',
    element: (
      <ProtectedRoute requiredPermission="ver_documento_pago">
        <PaymentDocumentsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin-documentos-pago',
    element: (
      <ProtectedRoute requiredPermission="admin_documentos_pago">
        <PaymentDocumentsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment-methods',
    element: (
      <ProtectedRoute requiredPermission="ver_forma_pago">
        <PaymentMethodsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin-forma-pago',
    element: (
      <ProtectedRoute requiredPermission="admin_forma_pago">
        <PaymentMethodsList />
      </ProtectedRoute>
    ),
  },
  // Líneas Telefónicas
  {
    path: '/phone-lines',
    element: (
      <ProtectedRoute requiredPermission="admin_lineas_telefonicas">
        <PhoneLinesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gestion-lineas',
    element: (
      <ProtectedRoute requiredPermission="admin_lineas_telefonicas">
        <PhoneLinesList />
      </ProtectedRoute>
    ),
  },
  // Paquetes
  {
    path: '/packages',
    element: (
      <ProtectedRoute requiredPermission="ver_paquetes">
        <PackagesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/packages/new',
    element: (
      <ProtectedRoute requiredPermission="admin_paquetes">
        <PackageForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/packages/edit/:id',
    element: (
      <ProtectedRoute requiredPermission="admin_paquetes">
        <PackageForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin-paquetes',
    element: (
      <ProtectedRoute requiredPermission="admin_paquetes">
        <PackagesList />
      </ProtectedRoute>
    ),
  },
];

export default superAdminRoutes;

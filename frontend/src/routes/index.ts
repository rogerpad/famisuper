import { RouteObject } from 'react-router-dom';
import authRoutes from './auth.routes';
import transactionsRoutes from './transactions.routes';
import turnosRoutes from './turnos.routes';
import usersRoutes from './users.routes';
import rolesRoutes from './roles.routes';
import providersRoutes from './providers.routes';
import agentClosingsRoutes from './agent-closings.routes';
import cashCountRoutes from './cash-count.routes';
import vendedorRoutes from './vendedor.routes';
import reportsRoutes from './reports.routes';
import superAdminRoutes from './super-admin.routes';
import balanceRoutes from './balance.routes';
import conteoBilletesSuperRoutes from './conteo-billetes-super.routes';
import adicionalesPrestamosRoutes from './adicionales-prestamos.routes';
import cierresSuperRoutes from './cierres-super.routes';
import debugRoutes from './debug.routes';

// Exportar todas las rutas públicas (fuera de MainLayout)
export const publicRoutes: RouteObject[] = [
  ...authRoutes,
  ...debugRoutes,
  ...turnosRoutes.filter(r => r.path === '/turnos/demo'), // Solo la ruta demo
];

// Exportar todas las rutas protegidas (dentro de MainLayout)
export const protectedRoutes: RouteObject[] = [
  ...transactionsRoutes,
  ...turnosRoutes.filter(r => r.path !== '/turnos/demo'), // Todas excepto demo
  ...usersRoutes,
  ...rolesRoutes,
  ...providersRoutes,
  ...agentClosingsRoutes,
  ...cashCountRoutes,
  ...vendedorRoutes,
  ...reportsRoutes,
  ...superAdminRoutes,
  ...balanceRoutes,
  ...conteoBilletesSuperRoutes,
  ...adicionalesPrestamosRoutes,
  ...cierresSuperRoutes,
];

// Exportar todas las rutas individualmente por si se necesitan
export {
  authRoutes,
  transactionsRoutes,
  turnosRoutes,
  usersRoutes,
  rolesRoutes,
  providersRoutes,
  agentClosingsRoutes,
  cashCountRoutes,
  vendedorRoutes,
  reportsRoutes,
  superAdminRoutes,
  balanceRoutes,
  conteoBilletesSuperRoutes,
  adicionalesPrestamosRoutes,
  cierresSuperRoutes,
  debugRoutes,
};

import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import TurnosList from '../pages/turnos/TurnosList';
import TurnosAdmin from '../pages/turnos/TurnosAdmin';
import TurnosVendedor from '../pages/turnos/TurnosVendedor';
import RegistrosActividadTurnos from '../pages/turnos/RegistrosActividadTurnos';
import TurnosAdminDemo from '../pages/turnos/TurnosAdminDemo';

const turnosRoutes: RouteObject[] = [
  // Ruta pública de demo
  {
    path: '/turnos/demo',
    element: <TurnosAdminDemo />,
  },
  // Rutas protegidas
  {
    path: '/turnos',
    element: (
      <ProtectedRoute requiredPermission="ver_turnos">
        <TurnosList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/turnos/admin',
    element: (
      <ProtectedRoute requiredPermission="ver_turnos">
        <TurnosAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/turnos/vendedor',
    element: (
      <ProtectedRoute requiredPermission="ver_mis_turnos">
        <TurnosVendedor />
      </ProtectedRoute>
    ),
  },
  {
    path: '/turnos/registros-actividad',
    element: (
      <ProtectedRoute requiredPermission="ver_registro_actividad_turnos">
        <RegistrosActividadTurnos />
      </ProtectedRoute>
    ),
  },
];

export default turnosRoutes;

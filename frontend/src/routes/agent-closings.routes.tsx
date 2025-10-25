import { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AgentClosingsList from '../pages/agent-closings/AgentClosingsList';
import AgentClosingForm from '../pages/agent-closings/AgentClosingForm';

const agentClosingsRoutes: RouteObject[] = [
  {
    path: '/agent-closings',
    element: (
      <ProtectedRoute requiredPermission="ver_cierres_agentes">
        <AgentClosingsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/agent-closings/new',
    element: (
      <ProtectedRoute requiredPermission="crear_cierres_agentes">
        <AgentClosingForm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/agent-closings/edit/:id',
    element: (
      <ProtectedRoute requiredPermission="editar_cierres_agentes">
        <AgentClosingForm />
      </ProtectedRoute>
    ),
  },
];

export default agentClosingsRoutes;

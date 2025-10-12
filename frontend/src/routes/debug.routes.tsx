import { RouteObject } from 'react-router-dom';
import TokenDebugger from '../components/debug/TokenDebugger';
import TokenManagerDebugger from '../components/debug/TokenManagerDebugger';

const debugRoutes: RouteObject[] = [
  {
    path: '/debug/token',
    element: <TokenDebugger />,
  },
  {
    path: '/debug/token-manager',
    element: <TokenManagerDebugger />,
  },
];

export default debugRoutes;

import { RouteObject } from 'react-router-dom';
import Login from '../pages/auth/Login';
import AccessDenied from '../pages/errors/AccessDenied';
import AuthLayout from '../layouts/AuthLayout';

const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
  {
    path: '/access-denied',
    element: <AccessDenied />,
  },
];

export default authRoutes;

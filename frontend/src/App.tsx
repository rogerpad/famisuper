import React from 'react';
import { useRoutes, RouteObject } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { TurnoProvider } from './contexts/TurnoContext';
import { SnackbarProvider } from 'notistack';

// Componente de protección de rutas
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/errors/NotFound';

// Rutas modulares
import { publicRoutes, protectedRoutes } from './routes';

// Tema de la aplicación
const theme = createTheme({
  palette: {
    primary: {
      main: '#dc7633', // Naranja (color solicitado)
      light: '#e68a4e', // Naranja claro
      dark: '#b35c20', // Naranja más oscuro
      contrastText: '#ffffff', // Texto blanco para contraste
    },
    secondary: {
      main: '#ff9800', // Naranja (puedes cambiarlo al color que prefieras)
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f5f5', // Fondo gris claro
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Sombra más sutil
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none', // Botones sin texto en mayúsculas
        },
      },
    },
  },
});

function App() {
  // Verificar si hay una redirección pendiente después de login
  React.useEffect(() => {
    const loginRedirect = sessionStorage.getItem('login_redirect');
    if (loginRedirect === 'true') {
      console.log('Detectada redirección post-login, limpiando bandera');
      sessionStorage.removeItem('login_redirect');
    }
  }, []);

  // Definir todas las rutas usando RouteObject
  const routes: RouteObject[] = [
    // Rutas públicas
    ...publicRoutes,
    
    // Rutas protegidas
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
            ...protectedRoutes,
          ],
        },
      ],
    },
    
    // Ruta 404
    {
      path: '*',
      element: <NotFound />,
    },
  ];

  const routing = useRoutes(routes);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <TurnoProvider>
            {routing}
          </TurnoProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;

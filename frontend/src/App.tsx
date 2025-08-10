import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import TurnoProvider from './contexts/TurnoContext';
import { SnackbarProvider } from 'notistack';

// Componente de protección de rutas
import ProtectedRoute from './components/ProtectedRoute';
import AccessDenied from './pages/AccessDenied';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import TransactionsList from './pages/transactions/TransactionsList';
import TransactionDetail from './pages/transactions/TransactionDetail';
import TransactionSummary from './pages/transactions/TransactionSummary';
import Reports from './pages/reports/Reports';
import RolesPermisos from './pages/roles/RolesPermisos';
import UsersList from './pages/users/UsersList';
import ProviderTypesList from './pages/provider-types/ProviderTypesList';
import ProvidersList from './pages/providers/ProvidersList';
import TransactionTypesList from './pages/transaction-types/TransactionTypesList';
import AgentClosingsList from './pages/agent-closings/AgentClosingsList';
import AgentClosingForm from './pages/agent-closings/AgentClosingForm';
import FormulaConfigForm from './pages/formula-configs/FormulaConfigForm';
import TurnosList from './pages/turnos/TurnosList';
import TurnosVendedor from './pages/turnos/TurnosVendedor';
import VendedorDashboard from './pages/vendedor/VendedorDashboard';
import TurnosAdmin from './pages/turnos/TurnosAdmin';
import RegistrosActividadTurnos from './pages/turnos/RegistrosActividadTurnos';
import TurnosAdminDemo from './pages/turnos/TurnosAdminDemo';
import CashCounterPage from './pages/cash/CashCounterPage';
import CashCountHistoryPage from './pages/CashCountHistoryPage';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

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
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <TurnoProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
            
            {/* Ruta de demostración de turnos - Accesible sin autenticación */}
            <Route path="/turnos/demo" element={<TurnosAdminDemo />} />
            
            {/* Ruta de acceso denegado (fuera de la protección) */}
            <Route path="/access-denied" element={<AccessDenied />} />
            
            {/* Rutas protegidas - Usando ProtectedRoute para verificar autenticación */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Dashboard principal - Accesible para todos los usuarios autenticados */}
                <Route index element={<Dashboard />} />
                
                {/* Rutas de Administrador con permisos específicos */}
                <Route path="/transactions" element={
                  <ProtectedRoute requiredPermission="ver_transacciones">
                    <TransactionsList />
                  </ProtectedRoute>
                } />
                <Route path="/transactions/:id" element={
                  <ProtectedRoute requiredPermission="ver_transacciones">
                    <TransactionDetail />
                  </ProtectedRoute>
                } />
                <Route path="/transaction-types" element={
                  <ProtectedRoute requiredPermission="ver_tipos_transaccion">
                    <TransactionTypesList />
                  </ProtectedRoute>
                } />
                <Route path="/agent-closings" element={
                  <ProtectedRoute requiredPermission="ver_cierres_agentes">
                    <AgentClosingsList />
                  </ProtectedRoute>
                } />
                <Route path="/agent-closings/new" element={
                  <ProtectedRoute requiredPermission="crear_cierres_agentes">
                    <AgentClosingForm />
                  </ProtectedRoute>
                } />
                <Route path="/agent-closings/edit/:id" element={
                  <ProtectedRoute requiredPermission="editar_cierres_agentes">
                    <AgentClosingForm />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredPermission="ver_reportes">
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/roles" element={
                  <ProtectedRoute requiredPermission="ver_roles">
                    <RolesPermisos />
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute requiredPermission="ver_usuarios">
                    <UsersList />
                  </ProtectedRoute>
                } />
                {/* Ruta de turnos eliminada para evitar duplicidad */}
                <Route path="/provider-types" element={
                  <ProtectedRoute requiredPermission="ver_tipos_proveedor">
                    <ProviderTypesList />
                  </ProtectedRoute>
                } />
                <Route path="/providers" element={
                  <ProtectedRoute requiredPermission="ver_proveedores">
                    <ProvidersList />
                  </ProtectedRoute>
                } />
                <Route path="/formula-configs/:providerId" element={
                  <ProtectedRoute requiredPermission="ver_proveedores">
                    <FormulaConfigForm />
                  </ProtectedRoute>
                } />
                
                {/* Rutas de administración de turnos con permisos granulares */}
                <Route path="/turnos" element={
                  <ProtectedRoute requiredPermission="ver_turnos">
                    <TurnosList />
                  </ProtectedRoute>
                } />
                <Route path="/turnos/admin" element={
                  <ProtectedRoute requiredPermission="ver_turnos">
                    <TurnosAdmin />
                  </ProtectedRoute>
                } />
                <Route path="/turnos/vendedor" element={
                  <ProtectedRoute requiredPermission="ver_turnos">
                    <TurnosVendedor />
                  </ProtectedRoute>
                } />
                <Route path="/turnos/registros-actividad" element={
                  <ProtectedRoute requiredPermission="ver_registro_actividad_turnos">
                    <RegistrosActividadTurnos />
                  </ProtectedRoute>
                } />

                {/* Rutas de Vendedor con permisos específicos */}
                <Route path="/vendedor" element={
                  <ProtectedRoute requiredPermission="ver_dashboard_vendedor">
                    <VendedorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/ventas" element={
                  <ProtectedRoute requiredPermission="ver_ventas">
                    <TransactionsList />
                  </ProtectedRoute>
                } />
                <Route path="/clientes" element={
                  <ProtectedRoute requiredPermission="ver_clientes">
                    <UsersList />
                  </ProtectedRoute>
                } />
                <Route path="/productos" element={
                  <ProtectedRoute requiredPermission="ver_productos">
                    <ProvidersList />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para el contador de efectivo */}
                <Route path="/cash-counter" element={
                  <ProtectedRoute requiredPermission="ver_contador_efectivo">
                    <CashCounterPage />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para el historial de conteos de efectivo */}
                <Route path="/cash-history" element={
                  <ProtectedRoute requiredPermission="ver_contador_efectivo">
                    <CashCountHistoryPage />
                  </ProtectedRoute>
                } />
              </Route>
            </Route>

            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TurnoProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;

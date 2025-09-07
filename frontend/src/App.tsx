import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import TurnoProvider from './contexts/TurnoContext';
import { SnackbarProvider } from 'notistack';
import TokenDebugger from './components/debug/TokenDebugger';
import TokenManagerDebugger from './components/debug/TokenManagerDebugger';

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
import PermissionsList from './components/permisos/PermissionsList';
import SuperExpenseTypesList from './components/super-expense-types/SuperExpenseTypesList';
import PaymentDocumentsList from './components/payment-documents/PaymentDocumentsList';
import PaymentMethodsList from './components/payment-methods/PaymentMethodsList';
import SuperExpensesList from './components/super-expenses/SuperExpensesList';
import PhoneLinesList from './components/phoneLines/PhoneLinesList';
import BalanceFlowsList from './components/balance-flows/BalanceFlowsList';
import BalanceSalesList from './components/balance-sales/BalanceSalesList';
import BalanceSaleForm from './components/balance-sales/BalanceSaleForm';
import PackagesList from './components/packages/PackagesList';
import PackageForm from './components/packages/PackageForm';
import { ConteoBilletesSuperList, ConteoBilletesSuperForm, ConteoBilletesSuperDetail } from './components/conteo-billetes-super';
import ConteoBilletesSuperPage from './pages/conteo-billetes-super/ConteoBilletesSuperPage';

// Adicionales Prestamos
import AdicionalesPrestamosPage from './pages/adicionales-prestamos/AdicionalesPrestamosPage';
import AdicionalesPrestamosFormPage from './pages/adicionales-prestamos/AdicionalesPrestamosFormPage';
import AdicionalesPrestamosDetallePage from './pages/adicionales-prestamos/AdicionalesPrestamosDetallePage';

// Cierres Super
import { CierresSuperList, CierreSuperForm, CierreSuperDetail } from './components/cierres-super';

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
            
            {/* Rutas de depuración de token JWT */}
            <Route path="/debug/token" element={<TokenDebugger />} />
            <Route path="/debug/token-manager" element={<TokenManagerDebugger />} />
            
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
                  <ProtectedRoute requiredPermission="ver_mis_turnos">
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
                
                {/* Ruta para gestión de permisos */}
                <Route path="/permissions" element={
                  <ProtectedRoute requiredPermission="admin_permisos">
                    <PermissionsList />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para egresos de super */}
                <Route path="/super-expenses" element={
                  <ProtectedRoute requiredPermission="ver_egresos_super">
                    <SuperExpensesList />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para tipos de egresos del super */}
                <Route path="/super-expense-types" element={
                  <ProtectedRoute requiredPermission="ver_tipos_egresos_super">
                    <SuperExpenseTypesList />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para documentos de pago */}
                <Route path="/payment-documents" element={
                  <ProtectedRoute requiredPermission="ver_documento_pago">
                    <PaymentDocumentsList />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para formas de pago */}
                <Route path="/payment-methods" element={
                  <ProtectedRoute requiredPermission="ver_forma_pago">
                    <PaymentMethodsList />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para líneas telefónicas */}
                <Route path="/phone-lines" element={
                  <ProtectedRoute requiredPermission="admin_lineas_telefonicas">
                    <PhoneLinesList />
                  </ProtectedRoute>
                } />
                
                {/* Ruta para flujos de saldo */}
                <Route path="/balance-flows" element={
                  <ProtectedRoute requiredPermission="ver_flujos_saldo">
                    <BalanceFlowsList />
                  </ProtectedRoute>
                } />
                
                {/* Rutas para ventas de saldo */}
                <Route path="/balance-sales" element={
                  <ProtectedRoute requiredPermission="ver_venta_paquete">
                    <BalanceSalesList />
                  </ProtectedRoute>
                } />
                <Route path="/balance-sales/new" element={
                  <ProtectedRoute requiredPermission="crear_editar_venta">
                    <BalanceSaleForm />
                  </ProtectedRoute>
                } />
                <Route path="/balance-sales/edit/:id" element={
                  <ProtectedRoute requiredPermission="crear_editar_venta">
                    <BalanceSaleForm />
                  </ProtectedRoute>
                } />
                
                {/* Rutas para paquetes */}
                <Route path="/packages" element={
                  <ProtectedRoute requiredPermission="ver_paquetes">
                    <PackagesList />
                  </ProtectedRoute>
                } />
                <Route path="/packages/new" element={
                  <ProtectedRoute requiredPermission="admin_paquetes">
                    <PackageForm />
                  </ProtectedRoute>
                } />
                <Route path="/packages/edit/:id" element={
                  <ProtectedRoute requiredPermission="admin_paquetes">
                    <PackageForm />
                  </ProtectedRoute>
                } />
                
                {/* Rutas para conteo de billetes super */}
                <Route path="/conteo-billetes-super" element={
                  <ProtectedRoute requiredPermission="ver_conteo_super">
                    <ConteoBilletesSuperPage />
                  </ProtectedRoute>
                } />
                <Route path="/conteo-billetes-super/new" element={
                  <ProtectedRoute requiredPermission="crear_editar_conteo_super">
                    <ConteoBilletesSuperForm />
                  </ProtectedRoute>
                } />
                <Route path="/conteo-billetes-super/edit/:id" element={
                  <ProtectedRoute requiredPermission="crear_editar_conteo_super">
                    <ConteoBilletesSuperForm />
                  </ProtectedRoute>
                } />
                <Route path="/conteo-billetes-super/view/:id" element={
                  <ProtectedRoute requiredPermission="ver_conteo_super">
                    <ConteoBilletesSuperDetail />
                  </ProtectedRoute>
                } />
                
                {/* Rutas para adicionales y préstamos */}
                <Route path="/adicionales-prestamos" element={
                  <ProtectedRoute requiredPermission="ver_adic_presta">
                    <AdicionalesPrestamosPage />
                  </ProtectedRoute>
                } />
                <Route path="/adicionales-prestamos/nuevo" element={
                  <ProtectedRoute requiredPermission="crear_editar_adic_prest">
                    <AdicionalesPrestamosFormPage />
                  </ProtectedRoute>
                } />
                <Route path="/adicionales-prestamos/editar/:id" element={
                  <ProtectedRoute requiredPermission="crear_editar_adic_prest">
                    <AdicionalesPrestamosFormPage />
                  </ProtectedRoute>
                } />
                <Route path="/adicionales-prestamos/detalle/:id" element={
                  <ProtectedRoute requiredPermission="ver_adic_presta">
                    <AdicionalesPrestamosDetallePage />
                  </ProtectedRoute>
                } />
                
                {/* Rutas para cierres super */}
                <Route path="/cierres-super" element={
                  <ProtectedRoute requiredPermission="ver_cierre_super">
                    <CierresSuperList />
                  </ProtectedRoute>
                } />
                <Route path="/cierres-super/new" element={
                  <ProtectedRoute requiredPermission="crear_editar_cierre_super">
                    <CierreSuperForm />
                  </ProtectedRoute>
                } />
                <Route path="/cierres-super/:id" element={
                  <ProtectedRoute requiredPermission="ver_cierre_super">
                    <CierreSuperDetail />
                  </ProtectedRoute>
                } />
                <Route path="/cierres-super/:id/edit" element={
                  <ProtectedRoute requiredPermission="crear_editar_cierre_super">
                    <CierreSuperForm />
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

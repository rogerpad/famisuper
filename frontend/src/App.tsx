import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Componente de protección de rutas
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import TransactionsList from './pages/transactions/TransactionsList';
import TransactionDetail from './pages/transactions/TransactionDetail';
import Reports from './pages/reports/Reports';
import RolesList from './pages/roles/RolesList';
import UsersList from './pages/users/UsersList';
import ProviderTypesList from './pages/provider-types/ProviderTypesList';
import ProvidersList from './pages/providers/ProvidersList';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

// Tema de la aplicación
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Rutas públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rutas protegidas - Ahora usando ProtectedRoute para verificar autenticación */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsList />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/roles" element={<RolesList />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/provider-types" element={<ProviderTypesList />} />
            <Route path="/providers" element={<ProvidersList />} />
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

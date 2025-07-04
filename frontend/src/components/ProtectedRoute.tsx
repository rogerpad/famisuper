import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredPermission?: string;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermission, children }) => {
  const { state: authState, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('ProtectedRoute - Estado de autenticación:', { 
    isAuthenticated: authState.isAuthenticated, 
    loading: authState.loading,
    hasUser: !!authState.user,
    permissionsCount: Object.keys(authState.permissions).length
  });
  
  // Verificar si hay un token en localStorage aunque el estado no lo refleje
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // Efecto para manejar el caso donde hay token en localStorage pero el estado no refleja autenticación
  React.useEffect(() => {
    if (token && !authState.isAuthenticated && !authState.loading) {
      console.log('Token encontrado en localStorage pero estado no autenticado, recargando página...');
      // Forzar una recarga completa de la página para reiniciar el estado
      window.location.reload();
    }
  }, [token, authState.isAuthenticated, authState.loading]);
  
  // Si hay token pero el estado no refleja autenticación, mostrar carga
  if (token && !authState.isAuthenticated) {
    console.log('Token encontrado en localStorage pero estado no autenticado, mostrando carga...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Box ml={2}>Verificando autenticación...</Box>
      </Box>
    );
  }
  
  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (authState.loading) {
    console.log('Estado de autenticación en carga...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Box ml={2}>Cargando...</Box>
      </Box>
    );
  }
  
  // Redirigir al login si no está autenticado
  if (!authState.isAuthenticated) {
    console.log('No autenticado, redirigiendo a login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si se requiere un permiso específico, verificar si el usuario lo tiene
  if (requiredPermission && !authState.permissions[requiredPermission]) {
    // Verificar permisos especiales basados en el rol
    const userRole = authState.user?.rol?.nombre;
    
    // Lista de permisos especiales por rol
    const specialRolePermissions: Record<string, string[]> = {
      'ADMIN': ['admin_turnos'] // El rol ADMIN siempre tiene acceso a admin_turnos
      // Puedes agregar más roles y sus permisos especiales aquí
    };
    
    // Verificar si el usuario tiene un rol con permisos especiales
    const hasSpecialPermission = userRole && 
      specialRolePermissions[userRole] && 
      specialRolePermissions[userRole].includes(requiredPermission);
    
    if (hasSpecialPermission) {
      console.log(`Permitiendo acceso a ${requiredPermission} para usuario con rol ${userRole}`);
    } else {
      // Redirigir a una página de acceso denegado
      console.log(`Acceso denegado a ${requiredPermission} para usuario con rol ${userRole}`);
      return <Navigate to="/access-denied" replace />;
    }
  }
  
  // Si hay children, renderizarlos directamente, de lo contrario usar Outlet para rutas anidadas
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const PermissionsDebug: React.FC = () => {
  const { state, hasPermission, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Función para recargar la página y forzar una nueva carga de permisos
  const handleReloadPermissions = () => {
    setLoading(true);
    // Limpiar la caché de permisos en localStorage
    localStorage.removeItem('permissions');
    // Recargar la página para forzar una nueva carga de permisos
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  // Lista de permisos clave para verificar
  const keyPermissions = [
    'ver_turnos',
    'iniciar_turnos',
    'finalizar_turnos',
    'admin_turnos'
  ];
  
  // Lista de roles para verificar
  const roles = ['Administrador', 'Vendedor'];
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Depuración de Permisos
      </Typography>
      
      <Box mb={2}>
        <Typography variant="subtitle1">Usuario Actual:</Typography>
        <Typography>
          {state.user ? `${state.user.nombre} ${state.user.apellido || ''} (${state.user.username})` : 'No hay usuario autenticado'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rol: {state.user?.rol?.nombre || 'Sin rol'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box mb={2}>
        <Typography variant="subtitle1">Verificación de Roles:</Typography>
        <List dense>
          {roles.map(role => (
            <ListItem key={role}>
              <ListItemText 
                primary={role} 
                secondary={hasRole(role) ? '✅ Tiene este rol' : '❌ No tiene este rol'} 
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="subtitle1">Permisos Clave:</Typography>
        <List dense>
          {keyPermissions.map(permission => (
            <ListItem key={permission}>
              <ListItemText 
                primary={permission} 
                secondary={hasPermission(permission) ? '✅ Tiene este permiso' : '❌ No tiene este permiso'} 
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="subtitle1">Todos los Permisos:</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
          {JSON.stringify(state.permissions, null, 2)}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" justifyContent="center">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReloadPermissions}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Recargar Permisos'}
        </Button>
      </Box>
    </Paper>
  );
};

export default PermissionsDebug;

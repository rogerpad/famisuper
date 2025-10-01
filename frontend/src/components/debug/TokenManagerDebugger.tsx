import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider, Button, Alert } from '@mui/material';
import jwtDecode from 'jwt-decode';

interface DecodedToken {
  sub: string;
  username: string;
  permissions?: string[];
  permisos?: string[];
  exp: number;
  iat: number;
  [key: string]: any;
}

const TokenManagerDebugger: React.FC = () => {
  const [tokenData, setTokenData] = useState<DecodedToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const decodeToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setTokenData(decoded);
        setError(null);
        console.log('Token decodificado:', decoded);
      } catch (err) {
        console.error('Error al decodificar token:', err);
        setError('Error al decodificar el token JWT');
        setTokenData(null);
      }
    } else {
      setError('No hay token JWT almacenado');
      setTokenData(null);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setMessage('Token eliminado correctamente. Deberás iniciar sesión nuevamente.');
    setTokenData(null);
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  useEffect(() => {
    decodeToken();
  }, []);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestor de Token JWT
      </Typography>
      
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={decodeToken}
          sx={{ mr: 1 }}
        >
          Actualizar Token
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          onClick={clearToken}
        >
          Limpiar Token
        </Button>
      </Box>
      
      {tokenData ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Información del Token
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText 
                primary="Usuario" 
                secondary={tokenData.username || 'No disponible'} 
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="ID de Usuario" 
                secondary={tokenData.sub || 'No disponible'} 
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="Rol" 
                secondary={tokenData.rolName || 'No disponible'} 
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1">Permisos (permissions)</Typography>
                {tokenData.permissions && tokenData.permissions.length > 0 ? (
                  <List dense>
                    {tokenData.permissions.map((permission, index) => (
                      <ListItem key={`perm-${index}`}>
                        <ListItemText primary={permission} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No hay permisos en el campo 'permissions'</Typography>
                )}
              </Box>
            </ListItem>
            <Divider />
            
            <ListItem>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1">Permisos (permisos)</Typography>
                {tokenData.permisos && tokenData.permisos.length > 0 ? (
                  <List dense>
                    {tokenData.permisos.map((permission, index) => (
                      <ListItem key={`perm-${index}`}>
                        <ListItemText primary={permission} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No hay permisos en el campo 'permisos'</Typography>
                )}
              </Box>
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="Expiración" 
                secondary={new Date(tokenData.exp * 1000).toLocaleString()} 
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemText 
                primary="¿Tiene permiso ver_adic_presta?" 
                secondary={
                  (tokenData.permissions && tokenData.permissions.includes('ver_adic_presta')) || 
                  (tokenData.permisos && tokenData.permisos.includes('ver_adic_presta')) 
                    ? 'SÍ' 
                    : 'NO'
                }
              />
            </ListItem>
          </List>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Token Completo (Decodificado)
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '300px'
            }}
          >
            {JSON.stringify(tokenData, null, 2)}
          </Box>
        </Box>
      ) : (
        <Typography>No hay información del token disponible</Typography>
      )}
    </Paper>
  );
};

export default TokenManagerDebugger;

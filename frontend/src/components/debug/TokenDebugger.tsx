import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
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

const TokenDebugger: React.FC = () => {
  const [tokenData, setTokenData] = useState<DecodedToken | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setTokenData(decoded);
        setError(null);
      } catch (err) {
        console.error('Error al decodificar token:', err);
        setError('Error al decodificar el token JWT');
        setTokenData(null);
      }
    } else {
      setError('No hay token JWT almacenado');
      setTokenData(null);
    }
  }, []);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Depurador de Token JWT
      </Typography>
      
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : tokenData ? (
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
                <Typography variant="subtitle1">Permisos</Typography>
                {tokenData.permissions && tokenData.permissions.length > 0 ? (
                  <List dense>
                    {tokenData.permissions.map((permission, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={permission} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No hay permisos en el token</Typography>
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
        <Typography>Cargando información del token...</Typography>
      )}
    </Paper>
  );
};

export default TokenDebugger;

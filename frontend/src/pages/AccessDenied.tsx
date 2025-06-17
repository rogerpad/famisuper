import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <LockIcon sx={{ fontSize: 60, color: '#dc7633', mb: 2 }} />
          
          <Typography component="h1" variant="h4" gutterBottom>
            Acceso Denegado
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            No tienes los permisos necesarios para acceder a esta página.
            Por favor, contacta al administrador si crees que deberías tener acceso.
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => navigate(-1)}
              sx={{ 
                bgcolor: '#dc7633',
                '&:hover': {
                  bgcolor: '#c26529',
                }
              }}
            >
              Volver
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
              sx={{ 
                color: '#dc7633', 
                borderColor: '#dc7633',
                '&:hover': {
                  borderColor: '#c26529',
                }
              }}
            >
              Ir al Inicio
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AccessDenied;

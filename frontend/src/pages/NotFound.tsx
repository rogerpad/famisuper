import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Página no encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Volver al inicio
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;

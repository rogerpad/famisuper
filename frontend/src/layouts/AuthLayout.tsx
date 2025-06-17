import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import Copyright from '../components/Copyright';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'primary.main',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" color="primary" gutterBottom>
            Famisuper
          </Typography>
          <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
            Sistema de Cierre de Transacciones
          </Typography>
          <Box sx={{ width: '100%', mt: 2 }}>
            <Outlet />
          </Box>
        </Paper>
        <Box sx={{ mt: 3 }}>
          <Copyright companyName="FamiSuper" />
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;

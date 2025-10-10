import React from 'react';
import { Container, Paper, Box, Typography } from '@mui/material';
import CashCountList from '../components/cash-count/CashCountList';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const CashCountHistoryPage: React.FC = () => {
  const { state: authState } = useAuth();
  
  // Verificar si el usuario está autenticado
  if (!authState.isAuthenticated || !authState.user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Historial de Conteos de Efectivo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulta y administra los registros históricos de conteos de efectivo.
          </Typography>
        </Box>
        
        <CashCountList />
      </Paper>
    </Container>
  );
};

export default CashCountHistoryPage;

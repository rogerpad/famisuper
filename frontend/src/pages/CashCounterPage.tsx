import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CashCounter from '../components/CashCounter';
import { useNavigate } from 'react-router-dom';

const CashCounterPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [showResetForm, setShowResetForm] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Contador de Efectivo
        </Typography>
        <Typography variant="body1" paragraph>
          Utilice esta herramienta para contar billetes y guardar los resultados en la base de datos.
        </Typography>
        
        {message && (
          <Box sx={{ mb: 2 }}>
            <Alert 
              severity={messageType} 
              onClose={() => setMessage(null)}
              action={messageType === 'success' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => setShowResetForm(true)}
                  >
                    Nuevo Conteo
                  </Button>
                  <Button 
                    color="inherit" 
                    size="small" 
                    startIcon={<RefreshIcon />}
                    onClick={() => navigate('/cash-history')}
                  >
                    Ver Historial
                  </Button>
                </Box>
              )}
            >
              {message}
            </Alert>
          </Box>
        )}
        
        {showResetForm ? (
          <CashCounter 
            key="new-counter" 
            onSave={(data) => {
              setMessage(`Conteo guardado exitosamente con un total de L${data.total.toFixed(2)}`);
              setMessageType('success');
              setShowResetForm(false);
            }}
          />
        ) : (
          <CashCounter 
            onSave={(data) => {
              setMessage(`Conteo guardado exitosamente con un total de L${data.total.toFixed(2)}`);
              setMessageType('success');
            }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default CashCounterPage;

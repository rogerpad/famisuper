import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import CashCounter from '../../components/CashCounter';
import CashCountList from '../../components/CashCountList';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cash-tabpanel-${index}`}
      aria-labelledby={`cash-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CashCounterPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { state } = useAuth(); // Corregido: useAuth() devuelve {state, login, logout, hasPermission, hasRole}
  const { turnoActual } = useTurno();
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSaveCashCount = (data: any) => {
    // Aquí se implementaría la lógica para guardar el conteo en el backend
    console.log('Guardando conteo de efectivo en el servidor:', data);
    // Por ahora solo guardamos en localStorage (ya implementado en el componente)
  };

  // Obtener información del usuario y turno actual
  const userName = state.user ? `${state.user.nombre} ${state.user.apellido}` : 'Usuario';
  const turnoName = turnoActual ? turnoActual.nombre : 'Sin turno asignado';
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Contador de Efectivo Agentes
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              <strong>Usuario:</strong> {userName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>Turno:</strong> {turnoName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>Fecha:</strong> {currentDate}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="cash counter tabs">
            <Tab label="Conteo de Efectivo" />
            <Tab label="Historial de Conteos" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Ingrese la cantidad de billetes y monedas para calcular el total de efectivo.
          </Typography>
          <CashCounter onSave={handleSaveCashCount} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Consulta y administra los registros históricos de conteos de efectivo.
          </Typography>
          <CashCountList />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default CashCounterPage;

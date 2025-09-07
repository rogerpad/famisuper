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
import { ConteoBilletesSuperForm, ConteoBilletesSuperList } from '../../components/conteo-billetes-super';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      id={`conteo-tabpanel-${index}`}
      aria-labelledby={`conteo-tab-${index}`}
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

const ConteoBilletesSuperPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { state } = useAuth();
  const { turnoActual } = useTurno();
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Obtener información del usuario y turno actual
  const userName = state.user ? `${state.user.nombre} ${state.user.apellido}` : 'Usuario';
  const turnoName = turnoActual ? turnoActual.nombre : 'Sin turno asignado';
  const currentDate = format(new Date(), 'PPP', { locale: es });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Contador de Efectivo Super
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
          
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="conteo billetes super tabs">
            <Tab label="Conteo de Efectivo" />
            <Tab label="Historial de Conteos" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ConteoBilletesSuperForm />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mt: 2 }}>
            <ConteoBilletesSuperList />
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ConteoBilletesSuperPage;

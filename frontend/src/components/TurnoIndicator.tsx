import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { useTurno } from '../contexts/TurnoContext';

const TurnoIndicator: React.FC = () => {
  // Agregar log para depuración
  console.log('Renderizando TurnoIndicator');
  const { turnoActual, loading } = useTurno();
  console.log('Estado del turno:', { turnoActual, loading });

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        ml: 2, 
        border: '2px solid #90caf9', 
        borderRadius: '8px', 
        padding: '6px 12px', 
        backgroundColor: '#e3f2fd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <ScheduleIcon sx={{ color: '#1976d2', mr: 1 }} />
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Cargando turno...
        </Typography>
      </Box>
    );
  }

  // Si no hay turno activo, mostrar un indicador de "Sin turno"
  if (!turnoActual) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        ml: 2, 
        border: '2px solid #ef5350', 
        borderRadius: '8px', 
        padding: '6px 12px', 
        backgroundColor: '#ffebee',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <ScheduleIcon sx={{ color: '#d32f2f', mr: 1 }} />
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
          Sin turno activo
        </Typography>
      </Box>
    );
  }

  // Formatear las horas para mostrar
  const formatHora = (horaString: string | undefined) => {
    if (!horaString) return 'N/A';
    try {
      const [horas, minutos] = horaString.split(':');
      return `${horas}:${minutos}`;
    } catch (err) {
      console.error('Error al formatear hora:', err);
      return 'N/A';
    }
  };

  // Determinar color según el turno
  const getColorByTurno = (nombreTurno: string) => {
    if (!nombreTurno) return 'default';
    
    if (nombreTurno.toLowerCase().includes('mañana')) return 'primary';
    if (nombreTurno.toLowerCase().includes('tarde')) return 'secondary';
    if (nombreTurno.toLowerCase().includes('noche')) return 'error';
    
    // Compatibilidad con los nombres antiguos
    if (nombreTurno.includes('A')) return 'primary';
    if (nombreTurno.includes('B')) return 'secondary';
    if (nombreTurno.includes('C')) return 'error';
    
    return 'default';
  };

  // Determinar color de fondo según el turno
  const getBgColorByTurno = (nombreTurno: string) => {
    if (!nombreTurno) return '#e3f2fd'; // Azul muy claro por defecto
    
    if (nombreTurno.toLowerCase().includes('mañana')) return '#e8f5e9'; // Verde claro
    if (nombreTurno.toLowerCase().includes('tarde')) return '#fff8e1'; // Amarillo claro
    if (nombreTurno.toLowerCase().includes('noche')) return '#fce4ec'; // Rosa claro
    
    // Compatibilidad con los nombres antiguos
    if (nombreTurno.includes('A')) return '#e8f5e9'; // Verde claro
    if (nombreTurno.includes('B')) return '#fff8e1'; // Amarillo claro
    if (nombreTurno.includes('C')) return '#fce4ec'; // Rosa claro
    
    return '#e3f2fd'; // Azul muy claro por defecto
  };

  // Determinar color del texto según el turno
  const getTextColorByTurno = (nombreTurno: string) => {
    if (!nombreTurno) return '#1976d2'; // Azul por defecto
    
    if (nombreTurno.toLowerCase().includes('mañana')) return '#2e7d32'; // Verde
    if (nombreTurno.toLowerCase().includes('tarde')) return '#f57f17'; // Ámbar
    if (nombreTurno.toLowerCase().includes('noche')) return '#c2185b'; // Rosa oscuro
    
    // Compatibilidad con los nombres antiguos
    if (nombreTurno.includes('A')) return '#2e7d32'; // Verde
    if (nombreTurno.includes('B')) return '#f57f17'; // Ámbar
    if (nombreTurno.includes('C')) return '#c2185b'; // Rosa oscuro
    
    return '#1976d2'; // Azul por defecto
  };

  const bgColor = getBgColorByTurno(turnoActual.nombre);
  const textColor = getTextColorByTurno(turnoActual.nombre);
  const borderColor = textColor;

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      ml: 2, 
      border: `2px solid ${borderColor}`, 
      borderRadius: '8px', 
      padding: '6px 12px', 
      backgroundColor: bgColor,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <ScheduleIcon sx={{ color: textColor, mr: 1 }} />
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: textColor }}>
        {turnoActual.nombre || 'Turno Activo'}: {formatHora(turnoActual.horaInicio)} - {formatHora(turnoActual.horaFin)}
      </Typography>
    </Box>
  );
};

export default TurnoIndicator;

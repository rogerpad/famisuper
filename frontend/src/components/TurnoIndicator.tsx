import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { useTurno } from '../contexts/TurnoContext';

const TurnoIndicator: React.FC = () => {
  const { turnoActual, loading } = useTurno();

  if (loading) {
    return (
      <Chip
        icon={<ScheduleIcon />}
        label="Cargando..."
        size="small"
        sx={{ ml: 1 }}
      />
    );
  }

  if (!turnoActual) {
    return null;
  }

  // Formatear las horas para mostrar
  const formatHora = (horaString: string) => {
    if (!horaString) return '';
    const [horas, minutos] = horaString.split(':');
    return `${horas}:${minutos}`;
  };

  // Determinar color según el turno
  const getColorByTurno = (nombreTurno: string) => {
    if (nombreTurno.includes('A')) return 'primary';
    if (nombreTurno.includes('B')) return 'secondary';
    return 'default';
  };

  return (
    <Tooltip title={`Horario: ${formatHora(turnoActual.horaInicio)} - ${formatHora(turnoActual.horaFin)}`}>
      <Chip
        icon={<ScheduleIcon />}
        label={turnoActual.nombre}
        color={getColorByTurno(turnoActual.nombre)}
        size="small"
        sx={{ ml: 1 }}
      />
    </Tooltip>
  );
};

export default TurnoIndicator;

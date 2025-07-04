import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import turnosApi, { Turno } from '../../api/turnos/turnosApi';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TurnosVendedor: React.FC = () => {
  const { state, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const userId = state.user?.id;

  // Depuración de permisos
  console.log('Permisos disponibles:', state.permissions);
  console.log('Tiene permiso iniciar_turnos:', hasPermission('iniciar_turnos'));
  console.log('Tiene permiso finalizar_turnos:', hasPermission('finalizar_turnos'));

  // Obtener los turnos asignados al usuario actual
  const { data: misTurnos, isLoading, error } = useQuery({
    queryKey: ['turnos', 'usuario', userId],
    queryFn: () => userId ? turnosApi.getTurnosPorUsuario(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Obtener el turno actual (si hay alguno iniciado)
  const { data: turnoActual, isLoading: loadingTurnoActual } = useQuery({
    queryKey: ['turno', 'actual'],
    queryFn: turnosApi.getTurnoActual,
  });

  // Mutaciones para iniciar y finalizar turnos
  const iniciarTurnoMutation = useMutation({
    mutationFn: (id: number) => turnosApi.iniciarTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
    },
  });

  const finalizarTurnoMutation = useMutation({
    mutationFn: (id: number) => turnosApi.finalizarTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
    },
  });

  // Manejadores para iniciar y finalizar turnos
  const handleIniciarTurno = (id: number) => {
    iniciarTurnoMutation.mutate(id);
  };

  const handleFinalizarTurno = (id: number) => {
    finalizarTurnoMutation.mutate(id);
  };

  // Formatear hora para mostrar
  const formatHora = (hora: string | null | undefined) => {
    if (!hora) return '-';
    try {
      // Si es una fecha ISO completa, formatearla
      if (hora.includes('T')) {
        return format(new Date(hora), 'HH:mm:ss', { locale: es });
      }
      // Si es solo hora, devolverla como está
      return hora;
    } catch (e) {
      return hora;
    }
  };

  // Renderizado condicional para estados de carga y error
  if (isLoading || loadingTurnoActual) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="warning">
          <AlertTitle>Error al cargar turnos</AlertTitle>
          <Typography variant="body2">
            No se pudieron cargar los turnos asignados. Por favor, intente nuevamente más tarde.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Si no hay turnos asignados
  if (!misTurnos || misTurnos.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          <AlertTitle>Sin turnos asignados</AlertTitle>
          <Typography variant="body2">
            No tienes turnos asignados actualmente. Por favor, contacta con tu supervisor.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Turnos
      </Typography>

      {/* Turno actual (si existe) */}
      {turnoActual && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>
            Turno Actual
          </Typography>
          <Card 
            variant="outlined" 
            sx={{ 
              borderColor: turnoActual.horaInicio && !turnoActual.horaFin ? 'success.main' : 'primary.main',
              boxShadow: 2
            }}
          >
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {turnoActual.nombre}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Hora inicio:</strong> {formatHora(turnoActual.horaInicio)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Hora fin:</strong> {formatHora(turnoActual.horaFin)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box mt={2}>
                <Chip
                  label={turnoActual.horaInicio && !turnoActual.horaFin ? 'En curso' : 
                         turnoActual.horaInicio && turnoActual.horaFin ? 'Finalizado' : 'No iniciado'}
                  color={turnoActual.horaInicio && !turnoActual.horaFin ? 'success' : 
                         turnoActual.horaInicio && turnoActual.horaFin ? 'default' : 'warning'}
                  size="medium"
                />
              </Box>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'center', gap: 3, p: 2 }}>
              {/* Botón para iniciar turno actual - SIEMPRE visible */}
              <Button
                variant="contained"
                size="large"
                color="success"
                startIcon={<PlayIcon />}
                onClick={() => handleIniciarTurno(turnoActual.id)}
                disabled={iniciarTurnoMutation.isLoading || Boolean(turnoActual.horaInicio)}
                sx={{ flex: 1, py: 1.5 }}
              >
                {iniciarTurnoMutation.isLoading ? 'Iniciando...' : 'Iniciar Turno'}
              </Button>
              
              {/* Botón para finalizar turno actual - SIEMPRE visible */}
              <Button
                variant="contained"
                size="large"
                color="warning"
                startIcon={<StopIcon />}
                onClick={() => handleFinalizarTurno(turnoActual.id)}
                disabled={finalizarTurnoMutation.isLoading || !turnoActual.horaInicio || Boolean(turnoActual.horaFin)}
                sx={{ flex: 1, py: 1.5 }}
              >
                {finalizarTurnoMutation.isLoading ? 'Finalizando...' : 'Finalizar Turno'}
              </Button>
            </CardActions>
          </Card>
        </Box>
      )}

      {/* Mensaje si no hay turno actual pero hay turnos asignados */}
      {!turnoActual && misTurnos.length > 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>Sin turno activo</AlertTitle>
          <Typography variant="body2">
            No tienes un turno activo en este momento. Selecciona uno de tus turnos asignados para iniciarlo.
          </Typography>
        </Alert>
      )}

      {/* Lista de todos mis turnos */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Todos mis turnos
        </Typography>
        <Grid container spacing={3}>
          {misTurnos.map((turno) => (
            <Grid item xs={12} sm={6} md={4} key={turno.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {turno.nombre}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Horario:</strong> {turno.horaInicio || '--:--'} a {turno.horaFin || '--:--'}
                    </Typography>
                  </Box>
                  {turno.descripcion && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {turno.descripcion}
                    </Typography>
                  )}
                  <Box mt={2}>
                    <Chip
                      label={turno.activo ? 'Activo' : 'Inactivo'}
                      color={turno.activo ? 'success' : 'error'}
                      size="small"
                    />
                    {turno.horaInicio && (
                      <Chip
                        label={`Iniciado: ${formatHora(turno.horaInicio)}`}
                        color="info"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {turno.horaFin && (
                      <Chip
                        label={`Finalizado: ${formatHora(turno.horaFin)}`}
                        color="default"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  {/* Información de depuración */}
                  <Box mt={1} p={1} bgcolor="#f5f5f5" borderRadius={1}>
                    <Typography variant="caption" component="div">
                      <strong>Debug:</strong> {' '}
                      Permiso iniciar: {hasPermission('iniciar_turnos') ? '✅' : '❌'}, {' '}
                      Sin hora inicio: {!turno.horaInicio ? '✅' : '❌'}, {' '}
                      Activo: {turno.activo ? '✅' : '❌'}
                    </Typography>
                    <Typography variant="caption" component="div">
                      Permiso finalizar: {hasPermission('finalizar_turnos') ? '✅' : '❌'}, {' '}
                      Con hora inicio: {turno.horaInicio ? '✅' : '❌'}, {' '}
                      Sin hora fin: {!turno.horaFin ? '✅' : '❌'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  {/* Botón para iniciar turno - SIEMPRE visible */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={() => handleIniciarTurno(turno.id)}
                    disabled={Boolean(turno.horaInicio) || iniciarTurnoMutation.isLoading}
                  >
                    Iniciar
                  </Button>
                  
                  {/* Botón para finalizar turno - SIEMPRE visible */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    startIcon={<StopIcon />}
                    onClick={() => handleFinalizarTurno(turno.id)}
                    disabled={!turno.horaInicio || Boolean(turno.horaFin) || finalizarTurnoMutation.isLoading}
                  >
                    Finalizar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default TurnosVendedor;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  AlertTitle,
  Chip,
  Paper,
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Stop as StopIcon, 
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import turnosApi, { Turno } from '../../api/turnos/turnosApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PermissionsDebug from '../../components/PermissionsDebug';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const TurnosVendedor: React.FC = () => {
  const { state, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const userId = state.user?.id;
  const [showDebug, setShowDebug] = useState(false);
  
  // Obtener la función refetchTurno del contexto de turno
  const { refetchTurno } = useTurno();

  // Estados para los diálogos de confirmación
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    confirmColor: 'primary' as 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
    icon: <WarningIcon color="warning" sx={{ fontSize: 40 }} />,
    onConfirm: () => {}
  });

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

  // Mutaciones para iniciar, finalizar y reiniciar turnos
  const iniciarTurnoMutation = useMutation({
    mutationFn: (id: number) => turnosApi.iniciarTurnoVendedor(id),
    onSuccess: (data) => {
      console.log('Turno iniciado exitosamente:', data);
      // Invalidar todas las consultas relacionadas para forzar una actualización
      // sin recargar la página completa
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
      queryClient.invalidateQueries({ queryKey: ['turnos', 'usuario', userId] });
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
    },
    onError: (error: any) => {
      console.error('Error al iniciar turno:', error);
      alert(`Error al iniciar turno: ${error.message}`);
    }
  });

  const finalizarTurnoMutation = useMutation({
    mutationFn: (id: number) => turnosApi.finalizarTurnoVendedor(id),
    onSuccess: (data) => {
      console.log('Turno finalizado exitosamente:', data);
      // Invalidar todas las consultas relacionadas para forzar una actualización
      // sin recargar la página completa
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
      queryClient.invalidateQueries({ queryKey: ['turnos', 'usuario', userId] });
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
    },
    onError: (error: any) => {
      console.error('Error al finalizar turno:', error);
      alert(`Error al finalizar turno: ${error.message}`);
    }
  });

  const reiniciarTurnoMutation = useMutation({
    mutationFn: (id: number) => turnosApi.reiniciarTurno(id),
    onSuccess: (data) => {
      console.log('Turno reiniciado exitosamente:', data);
      // Invalidar todas las consultas relacionadas para forzar una actualización
      // sin recargar la página completa
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
      queryClient.invalidateQueries({ queryKey: ['turnos', 'usuario', userId] });
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
    },
    onError: (error: any) => {
      console.error('Error al reiniciar turno:', error);
      alert(`Error al reiniciar turno: ${error.message}`);
    }
  });

  // Manejadores para iniciar, finalizar y reiniciar turnos como vendedor
  const handleIniciarTurno = (id: number) => {
    // Configurar y mostrar el diálogo de confirmación
    setDialogConfig({
      title: 'Iniciar Turno',
      message: '¿Estás seguro de que deseas iniciar este turno? Se registrará la hora actual como hora de inicio.',
      confirmText: 'Iniciar',
      confirmColor: 'success',
      icon: <PlayIcon color="success" sx={{ fontSize: 40 }} />,
      onConfirm: () => {
        iniciarTurnoMutation.mutate(id);
        setDialogOpen(false);
      }
    });
    setDialogOpen(true);
  };

  const handleFinalizarTurno = (id: number) => {
    // Configurar y mostrar el diálogo de confirmación
    setDialogConfig({
      title: 'Finalizar Turno',
      message: '¿Estás seguro de que deseas finalizar este turno? Se registrará la hora actual como hora de fin y el turno se marcará como inactivo.',
      confirmText: 'Finalizar',
      confirmColor: 'warning',
      icon: <StopIcon color="warning" sx={{ fontSize: 40 }} />,
      onConfirm: () => {
        finalizarTurnoMutation.mutate(id);
        setDialogOpen(false);
      }
    });
    setDialogOpen(true);
  };

  const handleReiniciarTurno = (id: number) => {
    // Configurar y mostrar el diálogo de confirmación
    setDialogConfig({
      title: 'Reiniciar Turno',
      message: '¿Estás seguro de que deseas reiniciar este turno? Esta acción eliminará la hora de inicio y fin, permitiendo iniciar el turno nuevamente.',
      confirmText: 'Reiniciar',
      confirmColor: 'secondary',
      icon: <RefreshIcon color="secondary" sx={{ fontSize: 40 }} />,
      onConfirm: () => {
        reiniciarTurnoMutation.mutate(id);
        setDialogOpen(false);
      }
    });
    setDialogOpen(true);
  };
  
  // Manejador para cerrar el diálogo sin realizar la acción
  const handleCloseDialog = () => {
    setDialogOpen(false);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Turnos
        </Typography>
        <FormControlLabel
          control={<Switch checked={showDebug} onChange={(e) => setShowDebug(e.target.checked)} />}
          label="Mostrar depuración"
        />
      </Box>
      
      {showDebug && <PermissionsDebug />}

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
                  {showDebug && (
                    <Box mt={1} p={1} bgcolor="#f5f5f5" borderRadius={1}>
                      <Typography variant="subtitle2" gutterBottom>Estado del Turno:</Typography>
                      <Typography variant="caption" component="div">
                        <strong>ID:</strong> {turno.id}, <strong>Activo:</strong> {turno.activo ? '✅' : '❌'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Hora inicio:</strong> {turno.horaInicio || 'No establecida'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Hora fin:</strong> {turno.horaFin || 'No establecida'}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>Condiciones de Botones:</Typography>
                      <Typography variant="caption" component="div">
                        <strong>Botón Iniciar deshabilitado si:</strong>
                      </Typography>
                      <Typography variant="caption" component="div">
                        - Sin permiso iniciar_turnos: {!hasPermission('iniciar_turnos') ? '✅ (deshabilitado)' : '❌ (habilitado)'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        - Ya tiene hora inicio: {Boolean(turno.horaInicio) ? '✅ (deshabilitado)' : '❌ (habilitado)'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        - Mutación cargando: {iniciarTurnoMutation.isLoading ? '✅ (deshabilitado)' : '❌ (habilitado)'}
                      </Typography>
                      
                      <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                        <strong>Botón Finalizar deshabilitado si:</strong>
                      </Typography>
                      <Typography variant="caption" component="div">
                        - Sin permiso finalizar_turnos: {!hasPermission('finalizar_turnos') ? '✅ (deshabilitado)' : '❌ (habilitado)'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        - Sin hora inicio: {!turno.horaInicio ? '✅ (deshabilitado)' : '❌ (habilitado)'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        - Ya tiene hora fin: {Boolean(turno.horaFin) ? '✅ (deshabilitado)' : '❌ (habilitado)'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        - Mutación cargando: {finalizarTurnoMutation.isLoading ? '✅ (deshabilitado)' : '❌ (habilitado)'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  {/* Botón para iniciar turno - Siempre visible pero deshabilitado si no tiene permiso */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={() => handleIniciarTurno(turno.id)}
                    disabled={!hasPermission('iniciar_turnos') || Boolean(turno.horaInicio) || iniciarTurnoMutation.isLoading}
                    title={!hasPermission('iniciar_turnos') ? 'No tienes permiso para iniciar turnos' : ''}
                  >
                    {iniciarTurnoMutation.isLoading && iniciarTurnoMutation.variables === turno.id ? 'Iniciando...' : 'Iniciar'}
                  </Button>
                  
                  {/* Botón para finalizar turno - Siempre visible pero deshabilitado si no tiene permiso */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    startIcon={<StopIcon />}
                    onClick={() => handleFinalizarTurno(turno.id)}
                    disabled={!hasPermission('finalizar_turnos') || !turno.horaInicio || Boolean(turno.horaFin) || finalizarTurnoMutation.isLoading}
                    title={!hasPermission('finalizar_turnos') ? 'No tienes permiso para finalizar turnos' : ''}
                  >
                    {finalizarTurnoMutation.isLoading && finalizarTurnoMutation.variables === turno.id ? 'Finalizando...' : 'Finalizar'}
                  </Button>

                  {/* Botón para reiniciar turno - Visible para usuarios con permiso reiniciar_turnos */}
                  {hasPermission('reiniciar_turnos') && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => handleReiniciarTurno(turno.id)}
                      disabled={reiniciarTurnoMutation.isLoading}
                      sx={{ mt: 1 }}
                    >
                      {reiniciarTurnoMutation.isLoading && reiniciarTurnoMutation.variables === turno.id ? 'Reiniciando...' : 'Reiniciar Turno'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Diálogo de confirmación estilizado */}
      <ConfirmationDialog
        open={dialogOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        confirmColor={dialogConfig.confirmColor}
        icon={dialogConfig.icon}
        onConfirm={dialogConfig.onConfirm}
        onCancel={handleCloseDialog}
      />
    </Box>
  );
};

export default TurnosVendedor;

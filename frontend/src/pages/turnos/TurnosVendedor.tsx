import React, { useState, useEffect } from 'react';
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
import turnosApi, { Turno, UsuarioTurno } from '../../api/turnos/turnosApi';
import usuariosTurnosApi from '../../api/turnos/usuarios-turnos';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PermissionsDebug from '../../components/auth/PermissionsDebug';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import OperationTypeDialog from '../../components/turnos/OperationTypeDialog';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TurnosVendedor: React.FC = () => {
  const { state, hasPermission, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const userId = state.user?.id;
  const [showDebug, setShowDebug] = useState(false);
  
  // Obtener la función refetchTurno del contexto de turno
  const { refetchTurno, setOperacionActiva, tieneTurnoActivo } = useTurno();

  // Estados para los diálogos de confirmación
  const [dialogOpen, setDialogOpen] = useState(false);
  const [operationTypeDialogOpen, setOperationTypeDialogOpen] = useState(false);
  const [selectedTurnoId, setSelectedTurnoId] = useState<number | null>(null);
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

  // Obtener los turnos activos del usuario (usando la nueva tabla tbl_usuarios_turnos)
  const { data: misTurnosActivos, isLoading, error, isLoading: loadingTurnosActivos } = useQuery({
    queryKey: ['turnos', 'usuario', userId, 'activos'],
    queryFn: () => userId ? usuariosTurnosApi.getTurnosActivosPorUsuario(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Obtener estado de operaciones en uso
  const { data: operacionesEnUso, isLoading: loadingOperaciones } = useQuery({
    queryKey: ['turnos', 'operaciones-en-uso'],
    queryFn: turnosApi.getOperacionesEnUso,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
  
  // Obtener todos los turnos asignados al usuario (usando el método original)
  const { data: turnosAsignados } = useQuery({
    queryKey: ['turnos', 'usuario', userId],
    queryFn: () => userId ? turnosApi.getTurnosPorUsuario(userId) : Promise.resolve([]),
    enabled: !!userId,
  });
  
  // Convertir las asignaciones a formato compatible con el componente
  const misTurnos = React.useMemo(() => {
    if (!turnosAsignados) return [];
    if (!misTurnosActivos) return turnosAsignados;
    
    // Crear un mapa de turnos activos por ID de turno para acceso rápido
    const turnosActivosMap = new Map();
    misTurnosActivos.forEach(turnoActivo => {
      turnosActivosMap.set(turnoActivo.turnoId, turnoActivo);
    });
    
    // Combinar la información de turnos asignados con los datos de turnos activos
    return turnosAsignados.map(turno => {
      const turnoActivo = turnosActivosMap.get(turno.id);
      
      return {
        id: turno.id,
        nombre: turno.nombre || 'Turno sin nombre',
        descripcion: turno.descripcion,
        // Usar los campos de tbl_usuarios_turnos si está activo, de lo contrario usar los de tbl_turnos
        horaInicio: turnoActivo?.horaInicioReal || null,
        horaFin: turnoActivo?.horaFinReal || null,
        activo: turnoActivo ? turnoActivo.activo : false,
        // Agregar el ID de la asignación si existe
        asignacionId: turnoActivo?.id
      };
    });
  }, [turnosAsignados, misTurnosActivos]);

  // Obtener el turno actual (si hay alguno iniciado)
  const { data: turnoActual, isLoading: loadingTurnoActual } = useQuery({
    queryKey: ['turno', 'actual'],
    queryFn: turnosApi.getTurnoActual,
  });

  // Mutaciones para iniciar, finalizar y reiniciar turnos
  const iniciarTurnoMutation = useMutation({
    mutationFn: (params: { id: number, operationType?: { agente: boolean; super: boolean } }) => 
      turnosApi.iniciarTurnoVendedor(params.id, params.operationType),
    onSuccess: (data) => {
      console.log('Turno iniciado exitosamente:', data);
      // Invalidar todas las consultas relacionadas para forzar una actualización
      // sin recargar la página completa
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
      queryClient.invalidateQueries({ queryKey: ['turnos', 'usuario', userId] });
      queryClient.invalidateQueries({ queryKey: ['turnos', 'usuario', userId, 'activos'] });
      queryClient.invalidateQueries({ queryKey: ['turnos', 'operaciones-en-uso'] });
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
      
      // Forzar una actualización del contexto después de un pequeño delay
      // para asegurar que la operación activa se detecte correctamente
      setTimeout(() => {
        refetchTurno();
      }, 500);
    },
    onError: (error: any) => {
      console.error('Error al iniciar turno:', error);
      // Actualizar la consulta de operaciones en uso después de un error
      queryClient.invalidateQueries({ queryKey: ['turnos', 'operaciones-en-uso'] });
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
      queryClient.invalidateQueries({ queryKey: ['turnos', 'usuario', userId, 'activos'] });
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
      // Actualizar operaciones en uso
      queryClient.invalidateQueries({ queryKey: ['turnos', 'operaciones-en-uso'] });
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
      queryClient.invalidateQueries({ queryKey: ['turnos', 'usuario', userId, 'activos'] });
      
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
    // Verificar si el usuario ya tiene un turno activo
    if (tieneTurnoActivo) {
      // Configurar y mostrar el diálogo de advertencia
      setDialogConfig({
        title: 'Turno Activo',
        message: 'Ya tienes un turno activo. Debes finalizar tu turno actual antes de iniciar uno nuevo.',
        confirmText: 'Entendido',
        confirmColor: 'warning',
        icon: <WarningIcon color="warning" sx={{ fontSize: 40 }} />,
        onConfirm: () => {
          setDialogOpen(false);
        }
      });
      setDialogOpen(true);
      return;
    }
    
    // Lógica específica para VendedorB - mostrar diálogo de selección para validación
    if (hasRole('VendedorB')) {
      // Mostrar diálogo de selección de operación para VendedorB también
      setSelectedTurnoId(id);
      setOperationTypeDialogOpen(true);
      return;
    }
    
    // Lógica original para Vendedor regular - mostrar diálogo de selección
    setSelectedTurnoId(id);
    setOperationTypeDialogOpen(true);
  };

  // Manejador para confirmar la selección del tipo de operación
  const handleConfirmOperationType = (operationType: { agente: boolean; super: boolean }) => {
    if (!selectedTurnoId) return;
    
    // Cerrar el diálogo de selección
    setOperationTypeDialogOpen(false);
    
    setDialogConfig({
      title: 'Iniciar Turno',
      message: `¿Estás seguro de que deseas iniciar el turno con la operación seleccionada?`,
      confirmText: 'Confirmar',
      confirmColor: 'primary',
      icon: <CheckCircleIcon />,
      onConfirm: () => {
        // Establecer la operación activa en el contexto
        const tipoOperacion = operationType.agente ? 'agente' : 'super';
        console.log('[TurnosVendedor] Estableciendo operación activa:', tipoOperacion);
        setOperacionActiva(tipoOperacion);
        
        iniciarTurnoMutation.mutate({
          id: selectedTurnoId,
          operationType
        });
        setDialogOpen(false);
      }
    });
    setDialogOpen(true);
  };
  
  // Manejador para cancelar la selección del tipo de operación
  const handleCancelOperationType = () => {
    setSelectedTurnoId(null);
    setOperationTypeDialogOpen(false);
  };

  const handleFinalizarTurno = (id: number) => {
    // Limpiar la operación activa al finalizar turno
    setOperacionActiva(null);
    // Configurar y mostrar el diálogo de confirmación
    setDialogConfig({
      title: 'Finalizar Turno',
      message: '¿Estás seguro de que deseas finalizar este turno? Se registrará la hora actual como hora de fin y el turno se marcará como inactivo.',
      confirmText: 'Finalizar',
      confirmColor: 'warning',
      icon: <StopIcon color="warning" sx={{ fontSize: 40 }} />,
      onConfirm: () => {
        // Usar el ID del turno para finalizar (el backend buscará la asignación correspondiente)
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
        // Usar el ID del turno para reiniciar (el backend buscará la asignación correspondiente)
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
  if (isLoading || loadingTurnoActual || loadingTurnosActivos) {
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
      </Box>
      
      {showDebug && <PermissionsDebug />}

      {/* Estado de operaciones en uso */}
      {operacionesEnUso && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Estado de Operaciones
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  bgcolor: operacionesEnUso.operacionAgente.enUso ? '#ffebee' : '#e8f5e8',
                  border: `1px solid ${operacionesEnUso.operacionAgente.enUso ? '#f44336' : '#4caf50'}`
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  {operacionesEnUso.operacionAgente.enUso ? (
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                  ) : (
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="subtitle1" fontWeight="bold">
                    Operación de Agentes
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {operacionesEnUso.operacionAgente.enUso ? (
                    <>
                      <strong>En uso por:</strong> {operacionesEnUso.operacionAgente.usuario ? 
                        `${operacionesEnUso.operacionAgente.usuario.nombre} ${operacionesEnUso.operacionAgente.usuario.apellido}` : 
                        'Usuario desconocido'
                      }
                    </>
                  ) : (
                    'Disponible'
                  )}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  bgcolor: operacionesEnUso.operacionSuper.enUso ? '#ffebee' : '#e8f5e8',
                  border: `1px solid ${operacionesEnUso.operacionSuper.enUso ? '#f44336' : '#4caf50'}`
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  {operacionesEnUso.operacionSuper.enUso ? (
                    <ErrorIcon color="error" sx={{ mr: 1 }} />
                  ) : (
                    <CheckIcon color="success" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="subtitle1" fontWeight="bold">
                    Operación de Super
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {operacionesEnUso.operacionSuper.enUso ? (
                    <>
                      <strong>En uso por:</strong> {operacionesEnUso.operacionSuper.usuario ? 
                        `${operacionesEnUso.operacionSuper.usuario.nombre} ${operacionesEnUso.operacionSuper.usuario.apellido}` : 
                        'Usuario desconocido'
                      }
                    </>
                  ) : (
                    'Disponible'
                  )}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Mostrar información sobre turnos activos en modo debug */}
      {showDebug && misTurnosActivos && (
        <Box mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="h6">Información de Turnos Activos (tbl_usuarios_turnos)</Typography>
          <Typography variant="body2">
            Turnos activos: {misTurnosActivos.length}
          </Typography>
          {misTurnosActivos.map((usuarioTurno, index) => (
            <Box key={index} mt={1} p={1} bgcolor="#e0e0e0" borderRadius={1}>
              <Typography variant="subtitle2">Turno Activo #{index + 1}</Typography>
              <Typography variant="body2">
                ID: {usuarioTurno.id}, Turno ID: {usuarioTurno.turnoId}, Usuario ID: {usuarioTurno.usuarioId}
              </Typography>
              <Typography variant="body2">
                Hora inicio real: {usuarioTurno.horaInicioReal || 'No establecida'}
              </Typography>
              <Typography variant="body2">
                Hora fin real: {usuarioTurno.horaFinReal || 'No establecida'}
              </Typography>
              <Typography variant="body2">
                Activo: {usuarioTurno.activo ? '✅' : '❌'}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

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
                        <strong>ID Turno:</strong> {turno.id}, <strong>ID Asignación:</strong> {turno.asignacionId}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Activo:</strong> {turno.activo ? '✅' : '❌'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Hora inicio real:</strong> {turno.horaInicio || 'No establecida'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <strong>Hora fin real:</strong> {turno.horaFin || 'No establecida'}
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
                  {/* Botón para iniciar turno - Siempre visible pero deshabilitado si no tiene permiso o ya tiene un turno activo */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={iniciarTurnoMutation.isLoading && iniciarTurnoMutation.variables?.id === turno.id ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
                    onClick={() => handleIniciarTurno(turno.id)}
                    disabled={!hasPermission('iniciar_turnos') || iniciarTurnoMutation.isLoading || tieneTurnoActivo || turno.activo}
                    title={!hasPermission('iniciar_turnos') ? 'No tienes permiso para iniciar turnos' : 
                           tieneTurnoActivo ? 'Ya tienes un turno activo' : 
                           turno.activo ? 'Este turno ya está activo' : ''}
                  >
                    {iniciarTurnoMutation.isLoading && iniciarTurnoMutation.variables?.id === turno.id ? 'Iniciando...' : 'Iniciar'}
                  </Button>
                  
                  {/* Botón para finalizar turno - Siempre visible pero deshabilitado si no tiene permiso */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    startIcon={<StopIcon />}
                    onClick={() => handleFinalizarTurno(turno.id)}
                    disabled={!hasPermission('finalizar_turnos') || !turno.activo || !turno.horaInicio || Boolean(turno.horaFin) || finalizarTurnoMutation.isLoading}
                    title={!hasPermission('finalizar_turnos') ? 'No tienes permiso para finalizar turnos' : 
                           !turno.activo ? 'Este turno no está activo' : ''}
                  >
                    {finalizarTurnoMutation.isLoading && finalizarTurnoMutation.variables === turno.id ? 'Finalizando...' : 'Finalizar'}
                  </Button>

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
      
      {/* Diálogo de selección de tipo de operación */}
      <OperationTypeDialog
        open={operationTypeDialogOpen}
        onClose={handleCancelOperationType}
        onConfirm={handleConfirmOperationType}
        turnoNombre='Turno'
      />
    </Box>
  );
};

export default TurnosVendedor;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  PersonAdd as PersonAddIcon 
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import turnosApi, { Turno } from '../../api/turnos/turnosApi';
import { useAuth } from '../../contexts/AuthContext';
import TurnoForm from '../turnos/TurnoForm';
import AsignarUsuariosDialog from './AsignarUsuariosDialog';
import { toValidId, isValidId } from '../../utils/validationUtils';

const TurnosList: React.FC = () => {
  const { state, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [turnoToDelete, setTurnoToDelete] = useState<Turno | null>(null);
  const [openAsignarUsuariosDialog, setOpenAsignarUsuariosDialog] = useState(false);
  const [turnoForAsignarUsuarios, setTurnoForAsignarUsuarios] = useState<Turno | null>(null);

  // Mutaciones para iniciar y finalizar turnos
  const iniciarTurnoMutation = useMutation({
    mutationFn: (id: number | string) => {
      const validId = toValidId(id);
      if (validId === undefined) {
        console.error(`[TURNOS LIST] ID de turno inválido para iniciar: ${id}`);
        throw new Error(`ID de turno inválido: ${id}`);
      }
      return turnosApi.iniciarTurno(validId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  const finalizarTurnoMutation = useMutation({
    mutationFn: (id: number | string) => {
      const validId = toValidId(id);
      if (validId === undefined) {
        console.error(`[TURNOS LIST] ID de turno inválido para finalizar: ${id}`);
        throw new Error(`ID de turno inválido: ${id}`);
      }
      return turnosApi.finalizarTurno(validId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  // Obtener la lista de turnos
  const { data: turnos, isLoading, error } = useQuery({
    queryKey: ['turnos'],
    queryFn: turnosApi.getAll,
  });

  // Mutación para eliminar un turno
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => {
      const validId = toValidId(id);
      if (validId === undefined) {
        console.error(`[TURNOS LIST] ID de turno inválido para eliminar: ${id}`);
        throw new Error(`ID de turno inválido: ${id}`);
      }
      return turnosApi.delete(validId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      setOpenDeleteDialog(false);
      setTurnoToDelete(null);
    },
  });

  // Manejadores de eventos
  const handleOpenForm = (turno: Turno | null = null) => {
    setSelectedTurno(turno);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTurno(null);
  };

  const handleOpenDeleteDialog = (turno: Turno) => {
    setTurnoToDelete(turno);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTurnoToDelete(null);
  };

  const handleDeleteTurno = () => {
    if (turnoToDelete && isValidId(turnoToDelete.id)) {
      console.log(`[TURNOS LIST] Eliminando turno con ID: ${turnoToDelete.id}`);
      deleteMutation.mutate(turnoToDelete.id);
    } else if (turnoToDelete) {
      console.error(`[TURNOS LIST] Intento de eliminar turno con ID inválido: ${turnoToDelete.id}`);
    }
  };

  // Manejadores para asignar usuarios
  const handleOpenAsignarUsuariosDialog = (turno: Turno) => {
    setTurnoForAsignarUsuarios(turno);
    setOpenAsignarUsuariosDialog(true);
  };

  const handleCloseAsignarUsuariosDialog = () => {
    setOpenAsignarUsuariosDialog(false);
    setTurnoForAsignarUsuarios(null);
  };

  // Manejadores para iniciar y finalizar turnos
  const handleIniciarTurno = (id: number | string) => {
    if (isValidId(id)) {
      console.log(`[TURNOS LIST] Iniciando turno con ID: ${id}`);
      iniciarTurnoMutation.mutate(id);
    } else {
      console.error(`[TURNOS LIST] Intento de iniciar turno con ID inválido: ${id}`);
    }
  };

  const handleFinalizarTurno = (id: number | string) => {
    if (isValidId(id)) {
      console.log(`[TURNOS LIST] Finalizando turno con ID: ${id}`);
      finalizarTurnoMutation.mutate(id);
    } else {
      console.error(`[TURNOS LIST] Intento de finalizar turno con ID inválido: ${id}`);
    }
  };

  // Renderizado condicional para estados de carga y error
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error('Error al cargar turnos:', error);
    return (
      <Box m={2}>
        <Alert severity="warning">
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              El módulo de turnos aún no está disponible en el backend
            </Typography>
            <Typography variant="body2" gutterBottom>
              El endpoint de la API para turnos no está implementado en el servidor. 
              Por favor, contacte al administrador del sistema para habilitar esta funcionalidad.
            </Typography>
            <Typography variant="caption" color="text.secondary" mt={1} display="block">
              Detalle técnico: {error instanceof Error ? error.message : 'Error desconocido'}
            </Typography>
          </Box>
        </Alert>
        
        <Box mt={3}>
          <Button 
            variant="contained" 
            onClick={() => window.history.back()}
            sx={{ bgcolor: '#dc7633', '&:hover': { bgcolor: '#c56a2d' } }}
          >
            Volver atrás
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Turnos
        </Typography>
        {hasPermission('crear_turnos') && (
          <Button
            variant="contained"
            sx={{ bgcolor: '#dc7633', '&:hover': { bgcolor: '#c56a2d' } }}
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Turno
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#dc7633' }}>
              <TableCell sx={{ color: 'white' }}>ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white' }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white' }}>Hora Inicio</TableCell>
              <TableCell sx={{ color: 'white' }}>Hora Fin</TableCell>
              <TableCell sx={{ color: 'white' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turnos?.map((turno) => (
              <TableRow key={turno.id}>
                <TableCell>{turno.id}</TableCell>
                <TableCell>{turno.nombre}</TableCell>
                <TableCell>{turno.usuarios && turno.usuarios.length > 0 ? 
                  turno.usuarios.map(u => `${u.nombre} ${u.apellido}`).join(', ') : 
                  'Sin usuarios asignados'}</TableCell>
                <TableCell>{turno.horaInicio || '-'}</TableCell>
                <TableCell>{turno.horaFin || '-'}</TableCell>
                <TableCell>{turno.descripcion || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={turno.activo ? 'Activo' : 'Inactivo'}
                    color={turno.activo ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {/* Botones de acción según permisos */}
                  {hasPermission('editar_turnos') && (
                    <Tooltip title="Editar turno">
                      <IconButton
                        color="primary"
                        aria-label="editar"
                        onClick={() => handleOpenForm(turno)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {hasPermission('editar_turnos') && (
                    <Tooltip title="Asignar usuarios">
                      <IconButton
                        color="primary"
                        aria-label="asignar usuarios"
                        onClick={() => handleOpenAsignarUsuariosDialog(turno)}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {hasPermission('eliminar_turnos') && (
                    <Tooltip title="Eliminar turno">
                      <IconButton
                        color="error"
                        aria-label="eliminar"
                        onClick={() => handleOpenDeleteDialog(turno)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {hasPermission('iniciar_turnos') && !turno.horaInicio && (
                    <Tooltip title="Iniciar turno">
                      <IconButton
                        color="success"
                        aria-label="iniciar turno"
                        onClick={() => handleIniciarTurno(turno.id)}
                        disabled={iniciarTurnoMutation.isLoading}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {hasPermission('finalizar_turnos') && turno.horaInicio && !turno.horaFin && (
                    <Tooltip title="Finalizar turno">
                      <IconButton
                        color="warning"
                        aria-label="finalizar turno"
                        onClick={() => handleFinalizarTurno(turno.id)}
                        disabled={finalizarTurnoMutation.isLoading}
                      >
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {turnos?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay turnos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario de turno (modal) */}
      <TurnoForm
        open={openForm}
        onClose={handleCloseForm}
        turno={selectedTurno}
      />

      {/* Diálogo para asignar usuarios */}
      <AsignarUsuariosDialog
        open={openAsignarUsuariosDialog}
        onClose={handleCloseAsignarUsuariosDialog}
        turno={turnoForAsignarUsuarios}
      />

      {/* Diálogo de confirmación para eliminar turno */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el turno "{turnoToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteTurno}
            color="error"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TurnosList;

import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Collapse,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Schedule as ScheduleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usersApi, { User } from '../../api/users/usersApi';
import turnosApi, { Turno } from '../../api/turnos/turnosApi';
// Importación local del componente UserForm que está en el mismo directorio
import UserForm from './UserForm';
import TurnoForm from '../turnos/TurnoForm';
import { useTurno } from '../../contexts/TurnoContext';

const UsersList: React.FC = () => {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Obtener la función refetchTurno del contexto de turno
  const { refetchTurno } = useTurno();
  
  // Estados para la gestión de turnos
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [openTurnoForm, setOpenTurnoForm] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [userForTurno, setUserForTurno] = useState<User | null>(null);
  const [openDeleteTurnoDialog, setOpenDeleteTurnoDialog] = useState(false);
  const [turnoToDelete, setTurnoToDelete] = useState<Turno | null>(null);

  // Obtener la lista de usuarios
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  // Obtener los turnos del usuario expandido
  const { data: userTurnos = [], isLoading: isLoadingTurnos, error: turnosError } = useQuery({
    queryKey: ['turnos', expandedUser],
    queryFn: async () => {
      if (expandedUser) {
        try {
          return await turnosApi.getByUsuarioId(expandedUser);
        } catch (error) {
          console.error('Error al obtener turnos del usuario:', error);
          return [];
        }
      }
      return [];
    },
    enabled: expandedUser !== null,
  });

  // Mutación para eliminar un usuario
  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    },
  });
  
  // Mutación para eliminar un turno
  const deleteTurnoMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        // Usar una función anónima async para evitar problemas de tipo
        await turnosApi.delete(id);
      } catch (error) {
        console.error(`Error al eliminar turno ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos', expandedUser] });
      setOpenDeleteTurnoDialog(false);
      setTurnoToDelete(null);
    },
  });
  
  // Mutación para iniciar un turno
  const iniciarTurnoMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        // Usar una función anónima async para evitar problemas de tipo
        return await turnosApi.iniciarTurno(id);
      } catch (error) {
        console.error(`Error al iniciar turno ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidar consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['turnos', expandedUser] });
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
    },
  });
  
  // Mutación para finalizar un turno
  const finalizarTurnoMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        // Usar una función anónima async para evitar problemas de tipo
        return await turnosApi.finalizarTurno(id);
      } catch (error) {
        console.error(`Error al finalizar turno ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidar consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['turnos', expandedUser] });
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['turno', 'actual'] });
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
    },
  });

  // Manejadores de eventos
  const handleOpenForm = (user: User | null = null) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };
  
  // Manejadores de eventos para turnos
  const handleToggleExpand = (userId: number) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };
  
  const handleOpenTurnoForm = (user: User, turno: Turno | null = null) => {
    setUserForTurno(user);
    setSelectedTurno(turno);
    setOpenTurnoForm(true);
  };
  
  const handleCloseTurnoForm = () => {
    setOpenTurnoForm(false);
    setUserForTurno(null);
    setSelectedTurno(null);
  };
  
  const handleOpenDeleteTurnoDialog = (turno: Turno) => {
    setTurnoToDelete(turno);
    setOpenDeleteTurnoDialog(true);
  };
  
  const handleCloseDeleteTurnoDialog = () => {
    setOpenDeleteTurnoDialog(false);
    setTurnoToDelete(null);
  };
  
  const handleDeleteTurno = () => {
    if (turnoToDelete) {
      deleteTurnoMutation.mutate(turnoToDelete.id);
    }
  };
  
  // Manejador para iniciar un turno
  const handleIniciarTurno = (turnoId: number) => {
    iniciarTurnoMutation.mutate(turnoId);
  };
  
  // Manejador para finalizar un turno
  const handleFinalizarTurno = (turnoId: number) => {
    finalizarTurnoMutation.mutate(turnoId);
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
    console.error('Error al cargar usuarios:', error);
    return (
      <Box m={2}>
        <Alert severity="error">
          Error al cargar los usuarios. Por favor, intente nuevamente.
          {error instanceof Error && (
            <Box mt={1}>
              <Typography variant="caption" color="error">
                Detalle: {error.message}
              </Typography>
            </Box>
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell>Último Acceso</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow sx={{ '& > *': { borderBottom: expandedUser === user.id ? 0 : 'inherit' } }}>
                  <TableCell>
                    <IconButton
                      aria-label="expandir detalles"
                      size="small"
                      onClick={() => handleToggleExpand(user.id)}
                      sx={{ color: '#dc7633' }}
                    >
                      {expandedUser === user.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.apellido || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.rol?.nombre || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.activo ? 'Activo' : 'Inactivo'}
                      color={user.activo ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      aria-label="editar"
                      onClick={() => handleOpenForm(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      aria-label="eliminar"
                      onClick={() => handleOpenDeleteDialog(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: '#dc7633' }}
                      aria-label="agregar turno"
                      onClick={() => handleOpenTurnoForm(user)}
                    >
                      <ScheduleIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                
                {/* Fila expandible para mostrar los turnos del usuario */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                    <Collapse in={expandedUser === user.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Turnos asignados
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenTurnoForm(user)}
                            sx={{ bgcolor: '#dc7633', '&:hover': { bgcolor: '#c56a2d' } }}
                          >
                            Nuevo Turno
                          </Button>
                        </Box>
                        
                        {isLoadingTurnos ? (
                          <Box display="flex" justifyContent="center" p={2}>
                            <CircularProgress size={30} />
                          </Box>
                        ) : turnosError ? (
                          <Alert severity="warning" sx={{ my: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              El módulo de turnos aún no está disponible en el backend.
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              La funcionalidad estará disponible cuando se implemente el endpoint en el servidor.
                            </Typography>
                          </Alert>
                        ) : userTurnos && userTurnos.length > 0 ? (
                          <Table size="small" aria-label="turnos">
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Hora Inicio</TableCell>
                                <TableCell>Hora Fin</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Activo</TableCell>
                                <TableCell>Acciones</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {userTurnos.map((turno: Turno) => (
                                <TableRow key={turno.id}>
                                  <TableCell>{turno.id}</TableCell>
                                  <TableCell>{turno.nombre}</TableCell>
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
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      aria-label="editar turno"
                                      onClick={() => handleOpenTurnoForm(user, turno)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      aria-label="eliminar turno"
                                      onClick={() => handleOpenDeleteTurnoDialog(turno)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="success"
                                      aria-label="iniciar turno"
                                      onClick={() => handleIniciarTurno(turno.id)}
                                      disabled={iniciarTurnoMutation.isLoading}
                                      title="Iniciar Turno"
                                    >
                                      <PlayArrowIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="warning"
                                      aria-label="finalizar turno"
                                      onClick={() => handleFinalizarTurno(turno.id)}
                                      disabled={finalizarTurnoMutation.isLoading}
                                      title="Finalizar Turno"
                                    >
                                      <StopIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography variant="body2" color="text.secondary" align="center" py={2}>
                            No hay turnos asignados a este usuario
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario de usuario (modal) */}
      <UserForm
        open={openForm}
        onClose={handleCloseForm}
        user={selectedUser}
      />

      {/* Formulario de turno (modal) */}
      {userForTurno && (
        <TurnoForm
          open={openTurnoForm}
          onClose={handleCloseTurnoForm}
          turno={selectedTurno}
          usuariosIds={userForTurno ? [userForTurno.id] : []}
        />
      )}

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar al usuario {userToDelete?.nombre} {userToDelete?.apellido}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar turno */}
      <Dialog
        open={openDeleteTurnoDialog}
        onClose={handleCloseDeleteTurnoDialog}
      >
        <DialogTitle>Confirmar eliminación de turno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el turno "{turnoToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteTurnoDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteTurno}
            color="error"
            disabled={deleteTurnoMutation.isLoading}
          >
            {deleteTurnoMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersList;

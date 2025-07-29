import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { useTurno } from '../../contexts/TurnoContext';
import turnosApi, { Turno as TurnoType, Usuario } from '../../api/turnos/turnosApi';
import usersApi, { User } from '../../api/users/usersApi';

// Adaptamos el tipo de la API para nuestro componente
interface Turno {
  id?: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  activo: boolean;
  usuarios?: Usuario[];
}

const TurnosAdmin: React.FC = () => {
  // Estado para la lista de turnos
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Estado para el diálogo de edición/creación
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTurno, setCurrentTurno] = useState<Turno | null>(null);
  const [isNewTurno, setIsNewTurno] = useState(false);
  
  // Estado para el diálogo de asignación de usuarios
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [currentTurnoForUsers, setCurrentTurnoForUsers] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Estado para notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Contexto de turno para refrescar el turno actual después de cambios
  const { refetchTurno } = useTurno();

  // Función para abrir el diálogo de creación
  const handleAddTurno = () => {
    setIsNewTurno(true);
    setCurrentTurno({
      id: Math.max(0, ...turnos.map(t => t.id || 0)) + 1,
      nombre: '',
      horaInicio: '08:00',
      horaFin: '16:00',
      descripcion: '',
      activo: true,
      usuarios: []
    });
    setOpenDialog(true);
  };

  // Función para abrir el diálogo de edición
  const handleEditTurno = (turno: Turno) => {
    setIsNewTurno(false);
    setCurrentTurno({ ...turno });
    setOpenDialog(true);
  };

  // Función para eliminar un turno
  const handleDeleteTurno = async (id: number) => {
    try {
      setLoadingAction(true);
      await turnosApi.delete(id);
      setTurnos(turnos.filter(turno => turno.id !== id));
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno(); 
      
      setSnackbar({
        open: true,
        message: 'Turno eliminado correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al eliminar turno:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el turno',
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Función para guardar un turno (nuevo o editado)
  const handleSaveTurno = async () => {
    if (!currentTurno) return;

    // Validaciones
    if (!currentTurno.nombre || !currentTurno.horaInicio || !currentTurno.horaFin) {
      setSnackbar({
        open: true,
        message: 'Por favor complete todos los campos obligatorios',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoadingAction(true);
      
      // Formatear horas al formato HH:MM (máximo 5 caracteres)
      const formatearHora = (hora: string): string => {
        if (!hora) return hora;
        // Si la hora incluye segundos (HH:MM:SS), eliminarlos
        if (hora.length > 5) {
          return hora.substring(0, 5);
        }
        return hora;
      };
      
      // Preparar datos para la API
      const turnoData = {
        nombre: currentTurno.nombre,
        horaInicio: formatearHora(currentTurno.horaInicio),
        horaFin: formatearHora(currentTurno.horaFin),
        descripcion: currentTurno.descripcion || '',
        activo: currentTurno.activo
      };
      
      if (isNewTurno) {
        // Crear nuevo turno
        const nuevoTurno = await turnosApi.create(turnoData);
        setTurnos([...turnos, mapApiTurnoToTurno(nuevoTurno)]);
        setSnackbar({
          open: true,
          message: 'Turno creado correctamente',
          severity: 'success'
        });
      } else {
        // Actualizar turno existente
        if (!currentTurno.id) {
          throw new Error('ID del turno no definido');
        }
        const turnoActualizado = await turnosApi.update(currentTurno.id, turnoData);
        setTurnos(turnos.map(turno => 
          turno.id === currentTurno.id ? mapApiTurnoToTurno(turnoActualizado) : turno
        ));
        setSnackbar({
          open: true,
          message: 'Turno actualizado correctamente',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      refetchTurno(); // Actualizar el turno actual
    } catch (error) {
      console.error('Error al guardar turno:', error);
      setSnackbar({
        open: true,
        message: `Error al ${isNewTurno ? 'crear' : 'actualizar'} el turno`,
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Función para manejar cambios en los campos del formulario
  const handleInputChange = (field: keyof Turno, value: any) => {
    if (!currentTurno) return;
    
    setCurrentTurno({
      ...currentTurno,
      [field]: value
    });
  };

  // Función para formatear la hora para mostrar
  const formatHora = (horaString: string) => {
    if (!horaString) return '';
    const [horas, minutos] = horaString.split(':');
    return `${horas}:${minutos}`;
  };

  // Función para convertir un objeto dayjs a string de hora
  const timeToString = (time: any) => {
    if (!time) return '';
    return time.format('HH:mm');
  };

  // Función para cargar los turnos desde la API
  const loadTurnos = async () => {
    try {
      setLoading(true);
      const turnosData = await turnosApi.getAll();
      setTurnos(turnosData.map(mapApiTurnoToTurno));
    } catch (error) {
      console.error('Error al cargar turnos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los turnos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para mapear el tipo de turno de la API al tipo local
  const mapApiTurnoToTurno = (apiTurno: TurnoType): Turno => ({
    id: apiTurno.id,
    nombre: apiTurno.nombre,
    horaInicio: apiTurno.horaInicio || '00:00',
    horaFin: apiTurno.horaFin || '00:00',
    descripcion: apiTurno.descripcion || '',
    activo: apiTurno.activo,
    // usuarioId se ha eliminado ya que no existe más en el backend
    usuarios: apiTurno.usuarios
  });

  // Cargar turnos al montar el componente
  useEffect(() => {
    loadTurnos();
    loadUsers();
  }, []);
  
  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await usersApi.getAll();
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los usuarios',
        severity: 'error'
      });
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Función para abrir el diálogo de asignación de usuarios
  const handleOpenUserDialog = async (turnoId: number) => {
    setCurrentTurnoForUsers(turnoId);
    try {
      setLoadingUsers(true);
      const turnoUsers = await turnosApi.getUsuariosPorTurno(turnoId);
      setSelectedUsers(turnoUsers.map(u => ({
        id: u.id,
        username: u.username,
        nombre: u.nombre,
        apellido: u.apellido,
        activo: true,
        rol_id: 0,
        fecha_registro: new Date()
      })));
      setOpenUserDialog(true);
    } catch (error) {
      console.error('Error al cargar usuarios del turno:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los usuarios asignados al turno',
        severity: 'error'
      });
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Función para guardar la asignación de usuarios
  const handleSaveUserAssignment = async () => {
    if (!currentTurnoForUsers) return;
    
    try {
      setLoadingAction(true);
      await turnosApi.asignarUsuarios(currentTurnoForUsers, selectedUsers.map(u => u.id));
      setSnackbar({
        open: true,
        message: 'Usuarios asignados correctamente',
        severity: 'success'
      });
      setOpenUserDialog(false);
      loadTurnos(); // Recargar turnos para actualizar la información
    } catch (error) {
      console.error('Error al asignar usuarios:', error);
      setSnackbar({
        open: true,
        message: 'Error al asignar usuarios al turno',
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Función para manejar el cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Función para iniciar un turno
  const handleIniciarTurno = async (id: number) => {
    try {
      setLoadingAction(true);
      await turnosApi.iniciarTurno(id);
      
      // Actualizar la lista de turnos
      await loadTurnos();
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
      
      setSnackbar({
        open: true,
        message: 'Turno iniciado correctamente',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error al iniciar turno:', error);
      setSnackbar({
        open: true,
        message: `Error al iniciar turno: ${error.message || 'Error desconocido'}`,
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Función para finalizar un turno
  const handleFinalizarTurno = async (id: number) => {
    try {
      setLoadingAction(true);
      await turnosApi.finalizarTurno(id);
      
      // Actualizar la lista de turnos
      await loadTurnos();
      
      // Actualizar el indicador de turno inmediatamente
      refetchTurno();
      
      setSnackbar({
        open: true,
        message: 'Turno finalizado correctamente',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error al finalizar turno:', error);
      setSnackbar({
        open: true,
        message: `Error al finalizar turno: ${error.message || 'Error desconocido'}`,
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administración de Turnos
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={loadTurnos}
            sx={{ mr: 2 }}
            disabled={loading || loadingAction}
          >
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddTurno}
            disabled={loading || loadingAction}
          >
            Nuevo Turno
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Hora Inicio</TableCell>
              <TableCell>Hora Fin</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : turnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No hay turnos registrados
                </TableCell>
              </TableRow>
            ) : (
              turnos.map((turno) => (
                <TableRow key={turno.id}>
                  <TableCell>{turno.id}</TableCell>
                  <TableCell>{turno.nombre}</TableCell>
                  <TableCell>{formatHora(turno.horaInicio)}</TableCell>
                  <TableCell>{formatHora(turno.horaFin)}</TableCell>
                  <TableCell>{turno.descripcion}</TableCell>
                  <TableCell>{turno.activo ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditTurno(turno)}
                      size="small"
                      disabled={loadingAction}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="info" 
                      onClick={() => turno.id ? handleOpenUserDialog(turno.id) : null}
                      size="small"
                      disabled={loadingAction}
                    >
                      <PeopleIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => turno.id ? handleDeleteTurno(turno.id) : null}
                      size="small"
                      disabled={loadingAction}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      color="success" 
                      onClick={() => turno.id ? handleIniciarTurno(turno.id) : null}
                      size="small"
                      disabled={loadingAction}
                      title="Iniciar Turno"
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton 
                      color="warning" 
                      onClick={() => turno.id ? handleFinalizarTurno(turno.id) : null}
                      size="small"
                      disabled={loadingAction}
                      title="Finalizar Turno"
                    >
                      <StopIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para crear/editar turnos */}
      <Dialog 
        open={openDialog} 
        onClose={() => !loadingAction && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={loadingAction}
      >
        <DialogTitle>
          {isNewTurno ? 'Crear Nuevo Turno' : 'Editar Turno'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={currentTurno?.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              required
            />
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimePicker
                  label="Hora de inicio"
                  value={currentTurno?.horaInicio ? dayjs(`2022-01-01T${currentTurno.horaInicio}`) : null}
                  onChange={(newValue) => handleInputChange('horaInicio', timeToString(newValue))}
                  sx={{ flex: 1 }}
                />
                <TimePicker
                  label="Hora de fin"
                  value={currentTurno?.horaFin ? dayjs(`2022-01-01T${currentTurno.horaFin}`) : null}
                  onChange={(newValue) => handleInputChange('horaFin', timeToString(newValue))}
                  sx={{ flex: 1 }}
                />
              </Box>
            </LocalizationProvider>
            
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={currentTurno?.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={currentTurno?.activo || false}
                  onChange={(e) => handleInputChange('activo', e.target.checked)}
                />
              }
              label="Activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={loadingAction}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveTurno} 
            variant="contained" 
            color="primary"
            disabled={loadingAction}
          >
            {loadingAction ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Diálogo para asignar usuarios a turnos */}
      <Dialog
        open={openUserDialog}
        onClose={() => !loadingAction && setOpenUserDialog(false)}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={loadingAction}
      >
        <DialogTitle>Asignar Usuarios al Turno</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Asignar Usuarios" />
              <Tab label="Usuarios Asignados" />
            </Tabs>
          </Box>
          {tabValue === 0 && (
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                multiple
                options={availableUsers}
                getOptionLabel={(option) => `${option.nombre} ${option.apellido || ''} (${option.username})`}
                value={selectedUsers}
                onChange={(event, newValue) => setSelectedUsers(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Seleccionar Usuarios"
                    placeholder="Buscar usuario"
                    fullWidth
                    disabled={loadingUsers || loadingAction}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.nombre} ${option.apellido || ''}`}
                      {...getTagProps({ index })}
                      disabled={loadingAction}
                    />
                  ))
                }
                loading={loadingUsers}
                disabled={loadingAction}
              />
            </Box>
          )}
          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              {loadingUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : selectedUsers.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2 }}>
                  No hay usuarios asignados a este turno
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Nombre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{`${user.nombre} ${user.apellido || ''}`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenUserDialog(false)}
            disabled={loadingAction}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveUserAssignment}
            variant="contained"
            color="primary"
            disabled={loadingAction}
          >
            {loadingAction ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TurnosAdmin;

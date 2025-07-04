import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

// Tipo para los turnos
interface Turno {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  activo: boolean;
}

const TurnosAdminDemo: React.FC = () => {
  // Estado para la lista de turnos
  const [turnos, setTurnos] = useState<Turno[]>([
    {
      id: 1,
      nombre: 'Turno A',
      horaInicio: '08:00',
      horaFin: '14:00',
      descripcion: 'Turno de mañana',
      activo: true
    },
    {
      id: 2,
      nombre: 'Turno B',
      horaInicio: '14:00',
      horaFin: '20:00',
      descripcion: 'Turno de tarde',
      activo: true
    }
  ]);

  // Estado para el diálogo de edición/creación
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTurno, setCurrentTurno] = useState<Turno | null>(null);
  const [isNewTurno, setIsNewTurno] = useState(false);

  // Estado para notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Función para abrir el diálogo de creación
  const handleAddTurno = () => {
    setIsNewTurno(true);
    setCurrentTurno({
      id: Math.max(0, ...turnos.map(t => t.id)) + 1,
      nombre: '',
      horaInicio: '08:00',
      horaFin: '16:00',
      descripcion: '',
      activo: true
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
  const handleDeleteTurno = (id: number) => {
    // En un entorno real, esto sería una llamada a la API
    setTurnos(turnos.filter(turno => turno.id !== id));
    setSnackbar({
      open: true,
      message: 'Turno eliminado correctamente',
      severity: 'success'
    });
  };

  // Función para guardar un turno (nuevo o editado)
  const handleSaveTurno = () => {
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

    // En un entorno real, esto sería una llamada a la API
    if (isNewTurno) {
      setTurnos([...turnos, currentTurno]);
      setSnackbar({
        open: true,
        message: 'Turno creado correctamente',
        severity: 'success'
      });
    } else {
      setTurnos(turnos.map(turno => 
        turno.id === currentTurno.id ? currentTurno : turno
      ));
      setSnackbar({
        open: true,
        message: 'Turno actualizado correctamente',
        severity: 'success'
      });
    }

    setOpenDialog(false);
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
    return horaString;
  };

  // Función para convertir un objeto dayjs a string de hora
  const timeToString = (time: any) => {
    if (!time) return '';
    return dayjs(time).format('HH:mm');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ mr: 1 }} />
            Administración de Turnos
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddTurno}
          >
            Nuevo Turno
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Configure los turnos de trabajo para el personal. Cada turno debe tener un horario definido y puede activarse o desactivarse según sea necesario.
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
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
              {turnos.map((turno) => (
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
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteTurno(turno.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo para crear/editar turnos */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveTurno} variant="contained" color="primary">
              Guardar
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
      </Paper>
    </Box>
  );
};

export default TurnosAdminDemo;

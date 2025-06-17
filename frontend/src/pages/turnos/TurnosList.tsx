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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import turnosApi, { Turno } from '../../api/turnos/turnosApi';
import TurnoForm from '../turnos/TurnoForm';

const TurnosList: React.FC = () => {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [turnoToDelete, setTurnoToDelete] = useState<Turno | null>(null);

  // Obtener la lista de turnos
  const { data: turnos, isLoading, error } = useQuery({
    queryKey: ['turnos'],
    queryFn: turnosApi.getAll,
  });

  // Mutación para eliminar un turno
  const deleteMutation = useMutation({
    mutationFn: (id: number) => turnosApi.delete(id),
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
    if (turnoToDelete) {
      deleteMutation.mutate(turnoToDelete.id);
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
        <Button
          variant="contained"
          sx={{ bgcolor: '#dc7633', '&:hover': { bgcolor: '#c56a2d' } }}
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nuevo Turno
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#dc7633' }}>
              <TableCell sx={{ color: 'white' }}>ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white' }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white' }}>Estado</TableCell>
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
                <TableCell>{turno.usuario?.nombre} {turno.usuario?.apellido}</TableCell>
                <TableCell>{turno.estado || '-'}</TableCell>
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
                    color="primary"
                    aria-label="editar"
                    onClick={() => handleOpenForm(turno)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="eliminar"
                    onClick={() => handleOpenDeleteDialog(turno)}
                  >
                    <DeleteIcon />
                  </IconButton>
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

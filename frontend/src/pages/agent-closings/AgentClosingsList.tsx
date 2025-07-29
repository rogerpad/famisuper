import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTurno } from '../../contexts/TurnoContext';
import turnosApi from '../../api/turnos/turnosApi';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { agentClosingsApi } from '../../api/agent-closings/agentClosingsApi';

const AgentClosingsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { turnoActual, refetchTurno } = useTurno();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClosingId, setSelectedClosingId] = useState<number | null>(null);
  const [finalizarTurnoDialogOpen, setFinalizarTurnoDialogOpen] = useState(false);

  // Formatear fechas para la API
  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  // Consulta para obtener los cierres finales de agentes
  const { data: closings, isLoading, refetch } = useQuery({
    queryKey: ['agentClosings', formattedStartDate, formattedEndDate],
    queryFn: () => agentClosingsApi.getAllAgentClosings(formattedStartDate, formattedEndDate),
  });

  // Mutación para eliminar un cierre
  const deleteMutation = useMutation({
    mutationFn: (id: number) => agentClosingsApi.deleteAgentClosing(id),
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setSelectedClosingId(null);
      queryClient.invalidateQueries({ queryKey: ['agentClosings'] });
    },
  });
  
  // Mutación para finalizar turno
  const finalizarTurnoMutation = useMutation({
    mutationFn: (id: number) => turnosApi.finalizarTurno(id),
    onSuccess: () => {
      setFinalizarTurnoDialogOpen(false);
      refetchTurno(); // Actualizar el contexto de turno
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      alert('Turno finalizado con éxito');
    },
    onError: (error) => {
      console.error('Error al finalizar turno:', error);
      alert('Error al finalizar el turno. Por favor, inténtelo de nuevo.');
    }
  });

  // Manejadores de eventos
  const handleAddClick = () => {
    navigate('/agent-closings/new');
  };

  const handleEditClick = (id: number) => {
    navigate(`/agent-closings/edit/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedClosingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedClosingId) {
      deleteMutation.mutate(selectedClosingId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedClosingId(null);
  };

  // Manejadores para finalizar turno
  const handleFinalizarTurnoClick = () => {
    setFinalizarTurnoDialogOpen(true);
  };

  const handleFinalizarTurnoConfirm = () => {
    if (turnoActual?.id) {
      finalizarTurnoMutation.mutate(turnoActual.id);
    } else {
      alert('No hay un turno activo para finalizar');
      setFinalizarTurnoDialogOpen(false);
    }
  };

  const handleFinalizarTurnoCancel = () => {
    setFinalizarTurnoDialogOpen(false);
  };

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return `L ${new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };

  const formatDate = (date: string) => {
    // Si la fecha está en formato YYYY-MM-DD, formatearla manualmente para evitar problemas de zona horaria
    if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    // Si no está en ese formato, usar date-fns (aunque puede tener problemas de zona horaria)
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="closings-icon" style={{ fontSize: '1.2em' }}>📊</span>
          Cierres Finales de Agentes
        </Typography>
        <Box display="flex" gap={2}>
          {turnoActual && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFinalizarTurnoClick}
              disabled={finalizarTurnoMutation.isLoading || !turnoActual}
              sx={{
                backgroundColor: '#2e86c1',
                '&:hover': {
                  backgroundColor: '#1a5276'
                },
              }}
            >
              {finalizarTurnoMutation.isLoading ? 'Finalizando...' : 'Finalizar Turno'}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/agent-closings/new')}
            sx={{
              backgroundColor: '#dc7633',
              '&:hover': {
                backgroundColor: '#b35c20'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Nuevo Cierre
          </Button>
        </Box>
      </Box>

      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha Inicio"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { width: 200 },
                },
              }}
            />

            <DatePicker
              label="Fecha Fin"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { width: 200 },
                },
              }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            onClick={() => refetch()}
            sx={{ 
              height: 40,
              backgroundColor: '#dc7633',
              '&:hover': {
                backgroundColor: '#b35c20'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Filtrar
          </Button>
        </Box>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Cargando...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'auto',  // Cambiado de 'hidden' a 'auto' para permitir scroll
          maxWidth: '100%',  // Asegurar que no exceda el ancho del contenedor padre
          '&::-webkit-scrollbar': {
            height: '8px',  // Altura de la barra de desplazamiento horizontal
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#dc7633',  // Color del pulgar de la barra de desplazamiento
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f5f5f5',  // Color de la pista de la barra de desplazamiento
          }
        }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Agente</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Cierre</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Saldo Inicial</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Adicional CTA</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Resultado Final</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Saldo Final</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Diferencia</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {closings?.length ? (
                closings.map((closing) => (
                  <TableRow key={closing.id}>
                    <TableCell>{closing.id}</TableCell>
                    <TableCell>{closing.proveedor?.nombre || 'N/A'}</TableCell>
                    <TableCell>{formatDate(closing.fechaCierre)}</TableCell>
                    <TableCell align="right">{formatCurrency(closing.saldoInicial)}</TableCell>
                    <TableCell align="right">{formatCurrency(closing.adicionalCta)}</TableCell>
                    <TableCell align="right">{formatCurrency(closing.resultadoFinal)}</TableCell>
                    <TableCell align="right">{formatCurrency(closing.saldoFinal)}</TableCell>
                    <TableCell align="right">{formatCurrency(closing.diferencia)}</TableCell>
                    <TableCell>
                      <Chip
                        label={closing.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        color={closing.estado === 'activo' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(closing.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(closing.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No hay cierres finales registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este cierre? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={() => selectedClosingId && deleteMutation.mutate(selectedClosingId)}
            color="error"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para finalizar turno */}
      <Dialog
        open={finalizarTurnoDialogOpen}
        onClose={handleFinalizarTurnoCancel}
      >
        <DialogTitle>Confirmar finalización de turno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea finalizar el turno actual? Esta acción no se puede deshacer.
            {turnoActual && (
              <Box mt={2}>
                <Typography variant="subtitle2">Detalles del turno:</Typography>
                <Typography variant="body2">ID: {turnoActual.id}</Typography>
                <Typography variant="body2">Nombre: {turnoActual.nombre}</Typography>
                <Typography variant="body2">Hora inicio: {turnoActual.horaInicio || 'No registrada'}</Typography>
                <Typography variant="body2">Hora fin programada: {turnoActual.horaFin || 'No definida'}</Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinalizarTurnoCancel}>Cancelar</Button>
          <Button 
            onClick={handleFinalizarTurnoConfirm}
            color="primary"
            disabled={finalizarTurnoMutation.isLoading}
          >
            {finalizarTurnoMutation.isLoading ? 'Finalizando...' : 'Finalizar Turno'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentClosingsList;

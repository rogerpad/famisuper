import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClosingId, setSelectedClosingId] = useState<number | null>(null);

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

  // Manejadores de eventos
  const handleAddClick = () => {
    navigate('/agent-closings/new');
  };

  const handleEditClick = (id: number) => {
    navigate(`/agent-closings/${id}`);
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

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return `L ${new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Cierres Finales de Agentes
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => navigate('/agent-closings/new')}
        >
          Nuevo Cierre
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
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
            variant="outlined"
            onClick={() => refetch()}
            sx={{ height: 40 }}
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Agente</TableCell>
                <TableCell>Fecha de Cierre</TableCell>
                <TableCell align="right">Saldo Inicial</TableCell>
                <TableCell align="right">Adicional CTA</TableCell>
                <TableCell align="right">Resultado Final</TableCell>
                <TableCell align="right">Saldo Final</TableCell>
                <TableCell align="right">Diferencia</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
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
                        onClick={() => navigate(`/agent-closings/${closing.id}`)}
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
            ¿Está seguro de que desea eliminar este cierre final? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
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

export default AgentClosingsList;

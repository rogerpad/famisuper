import React, { useEffect, useState } from 'react';
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
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSuperClosings } from '../../api/super-closings/superClosingsApi';
import { SuperClosing, SuperClosingFilters } from '../../api/super-closings/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import turnosApi from '../../api/turnos/turnosApi';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

const SuperClosingsList: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, superClosings, fetchSuperClosings, deleteSuperClosing, filterSuperClosings, getLastInactiveClosingOfDay } = useSuperClosings();
  const { state: authState } = useAuth();
  const { turnoActual, refetchTurno, turnosActivos } = useTurno();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [closingToDelete, setClosingToDelete] = useState<number | null>(null);
  const [filters, setFilters] = useState<SuperClosingFilters>({ activo: true });
  const [finalizarTurnoDialogOpen, setFinalizarTurnoDialogOpen] = useState(false);

  useEffect(() => {
    filterSuperClosings(filters);
  }, [filterSuperClosings]);

  const handleCreateClick = async () => {
    try {
      const ultimoCierre = await getLastInactiveClosingOfDay();
      
      if (ultimoCierre) {
        navigate('/cierres-super/new', { 
          state: { efectivoInicial: ultimoCierre.efectivoCierreTurno } 
        });
      } else {
        navigate('/cierres-super/new');
      }
    } catch (error) {
      console.error('Error validating previous closing:', error);
      navigate('/cierres-super/new');
    }
  };

  const handleEditClick = (id: number) => {
    navigate(`/cierres-super/${id}/edit`);
  };

  const handleViewClick = (id: number) => {
    navigate(`/cierres-super/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setClosingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (closingToDelete !== null) {
      const success = await deleteSuperClosing(closingToDelete);
      if (success) {
        fetchSuperClosings();
      }
    }
    setDeleteDialogOpen(false);
    setClosingToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClosingToDelete(null);
  };

  const handleFilterChange = (field: keyof SuperClosingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    filterSuperClosings(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchSuperClosings();
  };

  const handleFinalizarTurno = async () => {
    if (!turnoActual) {
      console.log('[SUPER_CLOSINGS] No active shift to finalize');
      return;
    }
    
    console.log('[SUPER_CLOSINGS] Starting shift finalization:', turnoActual);
    
    try {
      await turnosApi.finalizarTurnoSuper(turnoActual.id);
      console.log('[SUPER_CLOSINGS] Shift finalized successfully');
      
      setFinalizarTurnoDialogOpen(false);
      
      localStorage.removeItem('turnoActual');
      localStorage.removeItem('operacionActiva');
      
      await refetchTurno();
      fetchSuperClosings();
      
      enqueueSnackbar('Turno finalizado correctamente', { variant: 'success' });
      navigate('/turnos/vendedor');
    } catch (error: any) {
      console.error('[SUPER_CLOSINGS] Error finalizing shift:', error);
      
      let errorMessage = 'Error desconocido al finalizar el turno';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('[SUPER_CLOSINGS] Error message:', errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleFinalizarTurnoClick = () => {
    setFinalizarTurnoDialogOpen(true);
  };

  const handleFinalizarTurnoCancel = () => {
    setFinalizarTurnoDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  // Obtener el cajaNumero del turno activo del usuario
  const cajaNumeroActual = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
  console.log('[SuperClosingsList] Caja número del turno activo:', cajaNumeroActual);

  // Filtrar por caja y estado activo
  const filteredClosings = superClosings.filter(closing => {
    // Filtrar por estado activo
    const matchesActivo = closing.activo === true;
    
    // Filtrar por caja ESTRICTAMENTE: debe coincidir con el turno activo
    const matchesCaja = !cajaNumeroActual || closing.cajaNumero === cajaNumeroActual;
    
    return matchesActivo && matchesCaja;
  });

  const canCreateEdit = !!authState.permissions?.['crear_editar_cierre_super'];
  const canDelete = !!authState.permissions?.['eliminar_cierre_super'];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Cierres de Super</Typography>
        <Box display="flex" gap={2}>
          {turnoActual && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFinalizarTurnoClick}
              disabled={!turnoActual}
              sx={{
                backgroundColor: '#2e86c1',
                '&:hover': {
                  backgroundColor: '#1a5276'
                },
              }}
            >
              Finalizar Turno Super
            </Button>
          )}
          {canCreateEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
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
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={2}>Filtros</Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Inicio"
                value={filters.fechaInicio || null}
                onChange={(date) => handleFilterChange('fechaInicio', date)}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Fecha Fin"
                value={filters.fechaFin || null}
                onChange={(date) => handleFilterChange('fechaFin', date)}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="activo-label">Estado</InputLabel>
                <Select
                  labelId="activo-label"
                  value={filters.activo === undefined ? '' : filters.activo ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('activo', value === 'true' ? true : value === 'false' ? false : undefined);
                  }}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Activo</MenuItem>
                  <MenuItem value="false">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                Buscar
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Fecha Cierre</TableCell>
              <TableCell>Efectivo Inicial</TableCell>
              <TableCell>Efectivo Total</TableCell>
              <TableCell>Efectivo Cierre</TableCell>
              <TableCell>Faltante/Sobrante</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Cargando cierres...
                </TableCell>
              </TableRow>
            ) : filteredClosings.length > 0 ? (
              filteredClosings.map((closing: SuperClosing) => (
                <TableRow key={closing.id}>
                  <TableCell>{closing.id}</TableCell>
                  <TableCell>
                    {closing.usuario ? `${closing.usuario.nombre} ${closing.usuario.apellido || ''}` : `Usuario ID: ${closing.usuarioId}`}
                  </TableCell>
                  <TableCell>{formatDate(closing.fechaCierre)}</TableCell>
                  <TableCell>{formatCurrency(closing.efectivoInicial)}</TableCell>
                  <TableCell>{formatCurrency(closing.efectivoTotal)}</TableCell>
                  <TableCell>{formatCurrency(closing.efectivoCierreTurno)}</TableCell>
                  <TableCell>{formatCurrency(closing.faltanteSobrante)}</TableCell>
                  <TableCell>{closing.activo ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton onClick={() => handleViewClick(closing.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {canCreateEdit && (
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(closing.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick(closing.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay cierres registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este cierre? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={finalizarTurnoDialogOpen}
        onClose={handleFinalizarTurnoCancel}
      >
        <DialogTitle>Confirmar finalización de turno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Ya has creado el cierre de Super y desea finalizar el turno actual? Esta acción no se puede deshacer.
          </DialogContentText>
          
          {turnoActual && (
            <Box mt={2}>
              <Typography variant="subtitle2">Detalles del turno:</Typography>
              <Typography variant="body2">ID: {turnoActual.id}</Typography>
              <Typography variant="body2">Nombre: {turnoActual.nombre}</Typography>
              <Typography variant="body2">Hora inicio: {turnoActual.horaInicio || 'No registrada'}</Typography>
              <Typography variant="body2">Hora fin programada: {turnoActual.horaFin || 'No definida'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinalizarTurnoCancel}>Cancelar</Button>
          <Button 
            onClick={handleFinalizarTurno}
            color="primary"
          >
            Finalizar Turno
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperClosingsList;

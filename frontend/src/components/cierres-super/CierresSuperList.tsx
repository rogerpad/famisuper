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
import { useCierresSuper } from '../../api/cierres-super/cierresSuperApi';
import { CierreSuper, CierreSuperFilters } from '../../api/cierres-super/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import turnosApi from '../../api/turnos/turnosApi';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

const CierresSuperList: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, cierresSuper, fetchCierresSuper, deleteCierreSuper, filterCierresSuper, getUltimoCierreInactivoDelDia } = useCierresSuper();
  const { state: authState } = useAuth();
  const { turnoActual, refetchTurno } = useTurno();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cierreToDelete, setCierreToDelete] = useState<number | null>(null);
  const [filters, setFilters] = useState<CierreSuperFilters>({ activo: true });
  const [finalizarTurnoDialogOpen, setFinalizarTurnoDialogOpen] = useState(false);

  useEffect(() => {
    // Cargar registros activos por defecto
    filterCierresSuper(filters);
  }, [filterCierresSuper]);

  const handleCreateClick = async () => {
    try {
      // Obtener el último cierre inactivo del día para el efectivo inicial
      const ultimoCierre = await getUltimoCierreInactivoDelDia();
      
      if (ultimoCierre) {
        // Si existe un cierre anterior inactivo del mismo día, navegar con el efectivo inicial
        navigate('/cierres-super/new', { 
          state: { efectivoInicial: ultimoCierre.efectivoCierreTurno } 
        });
      } else {
        // Si no existe cierre anterior o es el primer turno del día, navegar sin efectivo inicial
        navigate('/cierres-super/new');
      }
    } catch (error) {
      console.error('Error al validar cierre anterior:', error);
      // En caso de error, navegar normalmente
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
    setCierreToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (cierreToDelete !== null) {
      const success = await deleteCierreSuper(cierreToDelete);
      if (success) {
        fetchCierresSuper();
      }
    }
    setDeleteDialogOpen(false);
    setCierreToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCierreToDelete(null);
  };

  const handleFilterChange = (field: keyof CierreSuperFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    filterCierresSuper(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchCierresSuper();
  };

  // Manejador para finalizar turno
  const handleFinalizarTurno = async () => {
    if (!turnoActual) {
      console.log('[CIERRES_SUPER] No hay turno actual para finalizar');
      return;
    }
    
    console.log('[CIERRES_SUPER] Iniciando finalización de turno:', turnoActual);
    
    try {
      // Usar el método específico para super que actualiza tablas de operación de super
      await turnosApi.finalizarTurnoSuper(turnoActual.id);
      console.log('[CIERRES_SUPER] Turno finalizado exitosamente');
      
      setFinalizarTurnoDialogOpen(false);
      
      // Limpiar localStorage inmediatamente para evitar inconsistencias
      localStorage.removeItem('turnoActual');
      localStorage.removeItem('operacionActiva');
      
      // Refrescar datos del servidor inmediatamente
      await refetchTurno();
      fetchCierresSuper();
      
      enqueueSnackbar('Turno finalizado correctamente', { variant: 'success' });
      
      // Redireccionar a Mis turnos después de finalizar
      navigate('/turnos/vendedor');
    } catch (error: any) {
      console.error('[CIERRES_SUPER] Error al finalizar turno:', error);
      
      // Extraer mensaje de error detallado
      let errorMessage = 'Error desconocido al finalizar el turno';
      
      if (error.response) {
        // Error de la API
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('[CIERRES_SUPER] Mensaje de error:', errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Manejadores para finalizar turno
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
            ) : cierresSuper.length > 0 ? (
              cierresSuper.map((cierre: CierreSuper) => (
                <TableRow key={cierre.id}>
                  <TableCell>{cierre.id}</TableCell>
                  <TableCell>
                    {cierre.usuario ? `${cierre.usuario.nombre} ${cierre.usuario.apellido || ''}` : `Usuario ID: ${cierre.usuarioId}`}
                  </TableCell>
                  <TableCell>{formatDate(cierre.fechaCierre)}</TableCell>
                  <TableCell>{formatCurrency(cierre.efectivoInicial)}</TableCell>
                  <TableCell>{formatCurrency(cierre.efectivoTotal)}</TableCell>
                  <TableCell>{formatCurrency(cierre.efectivoCierreTurno)}</TableCell>
                  <TableCell>{formatCurrency(cierre.faltanteSobrante)}</TableCell>
                  <TableCell>{cierre.activo ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton onClick={() => handleViewClick(cierre.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {canCreateEdit && (
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditClick(cierre.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick(cierre.id)}>
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

      {/* Diálogo de confirmación para finalizar turno */}
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

export default CierresSuperList;

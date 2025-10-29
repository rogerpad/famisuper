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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useSuperExpenses } from '../../api/super-expenses/superExpensesApi';
import { SuperExpense } from '../../api/super-expenses/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SuperExpenseForm from './SuperExpenseForm';
import SuperExpenseDetail from './SuperExpenseDetail';

const SuperExpensesList: React.FC = () => {
  const { superExpenses, loading: isLoading, error, fetchSuperExpenses, deleteSuperExpense } = useSuperExpenses();
  const isError = !!error;
  const { hasPermission } = useAuth();
  const { turnosActivos } = useTurno();
  
  // Función para recargar datos incluyendo inactivos
  const refetch = () => fetchSuperExpenses(true);
  
  // Cargar datos con inactivos al montar el componente
  React.useEffect(() => {
    fetchSuperExpenses(true);
  }, [fetchSuperExpenses]);
  
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSuperExpense, setSelectedSuperExpense] = useState<SuperExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Mantenemos filterType pero eliminamos setFilterType de la desestructuración para evitar la advertencia
  const [filterType] = useState<number | ''>('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive'>('active');

  const canCreate = hasPermission('crear_egreso_super');
  const canEdit = hasPermission('editar_egreso_super');
  const canDelete = hasPermission('eliminar_egreso_super');

  const handleOpenForm = (superExpense?: SuperExpense) => {
    setSelectedSuperExpense(superExpense || null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedSuperExpense(null);
  };

  const handleOpenDetail = (superExpense: SuperExpense) => {
    setSelectedSuperExpense(superExpense);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedSuperExpense(null);
  };

  const handleOpenDeleteDialog = (superExpense: SuperExpense) => {
    setSelectedSuperExpense(superExpense);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedSuperExpense(null);
  };

  const handleDelete = async () => {
    if (selectedSuperExpense) {
      try {
        await deleteSuperExpense(selectedSuperExpense.id);
        refetch();
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Error al eliminar el egreso:', error);
      }
    }
  };

  const handleFormSubmit = () => {
    refetch();
    handleCloseForm();
  };

  // Obtener el cajaNumero del turno activo del usuario
  const cajaNumeroActual = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
  console.log('[SuperExpensesList] Caja número del turno activo:', cajaNumeroActual);

  console.log('[SuperExpensesList] Filtro status actual:', filterStatus);
  console.log('[SuperExpensesList] Total registros antes de filtrar:', superExpenses?.length || 0);

  const filteredSuperExpenses = superExpenses?.filter(expense => {
    const matchesSearch = searchTerm === '' || 
      (expense.descripcionEgreso?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (expense.tipoEgreso?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesType = filterType === '' || expense.tipoEgresoId === filterType;
    
    const matchesDate = filterDate === '' || 
      (expense.fechaEgreso && String(expense.fechaEgreso).includes(filterDate));
    
    // Filtrar por estado
    let matchesStatus = true;
    
    if (filterStatus === 'active') {
      // Mostrar todos los registros activos sin importar la fecha
      matchesStatus = expense.activo === true;
    } else if (filterStatus === 'inactive') {
      // Mostrar solo registros inactivos del día actual
      const today = new Date();
      // Formatear fecha actual en zona horaria local
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      let expenseDateStr = '';
      if (expense.fechaEgreso) {
        if (typeof expense.fechaEgreso === 'string') {
          // Si es string, extraer solo la parte de fecha
          expenseDateStr = expense.fechaEgreso.split('T')[0];
        } else {
          // Si es Date, formatear en zona horaria local
          const date = new Date(expense.fechaEgreso);
          expenseDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
      }
      
      const isToday = expenseDateStr === todayStr;
      matchesStatus = expense.activo === false && isToday;
      
      if (expense.activo === false) {
        console.log('[SuperExpensesList] Registro inactivo encontrado:', {
          id: expense.id,
          descripcion: expense.descripcionEgreso,
          fecha: expenseDateStr,
          hoy: todayStr,
          esHoy: isToday,
          pasaFiltro: matchesStatus
        });
      }
    }
    
    // Filtrar por caja número del turno activo (SIEMPRE, incluso para "Hoy inactivas")
    let matchesCaja = true;
    if (cajaNumeroActual && expense.cajaNumero) {
      matchesCaja = expense.cajaNumero === cajaNumeroActual;
      console.log('[SuperExpensesList] Filtro por caja - ID:', expense.id, 'Caja egreso:', expense.cajaNumero, 'Caja actual:', cajaNumeroActual, 'Coincide:', matchesCaja);
    }
    
    return matchesSearch && matchesType && matchesDate && matchesStatus && matchesCaja;
  }) || [];

  console.log('[SuperExpensesList] Total registros después de filtrar:', filteredSuperExpenses.length);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">Error al cargar los egresos: {String(error)}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Egresos de Super
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Egreso
          </Button>
        )}
      </Box>

      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-status-label">Filtrar por</InputLabel>
              <Select
                labelId="filter-status-label"
                value={filterStatus}
                onChange={(e: SelectChangeEvent<'active' | 'inactive'>) => setFilterStatus(e.target.value as 'active' | 'inactive')}
                label="Filtrar por"
              >
                <MenuItem value="active">Activas</MenuItem>
                <MenuItem value="inactive">Hoy inactivas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descripción o tipo..."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Filtrar por fecha"
              type="date"
              variant="outlined"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo de Egreso</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>No. Factura</TableCell>
              <TableCell>Exento</TableCell>
              <TableCell>Gravado</TableCell>
              <TableCell>Impuesto</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Forma de Pago</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuperExpenses.length > 0 ? (
              filteredSuperExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.tipoEgreso?.nombre || 'N/A'}</TableCell>
                  <TableCell>{expense.descripcionEgreso || '-'}</TableCell>
                  <TableCell>{expense.documentoPago?.nombre || 'N/A'}</TableCell>
                  <TableCell>{expense.nroFactura || '-'}</TableCell>
                  <TableCell>{formatCurrency(expense.excento)}</TableCell>
                  <TableCell>{formatCurrency(expense.gravado)}</TableCell>
                  <TableCell>{formatCurrency(expense.impuesto)}</TableCell>
                  <TableCell>{formatCurrency(expense.total)}</TableCell>
                  <TableCell>{expense.formaPago?.nombre || 'N/A'}</TableCell>
                  <TableCell>{formatDate(expense.fechaEgreso)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDetail(expense)}
                    >
                      <ViewIcon />
                    </IconButton>
                    {canEdit && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenForm(expense)}
                        disabled={expense.activo === false}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(expense)}
                        disabled={expense.activo === false}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No hay egresos para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario para crear/editar egresos */}
      <SuperExpenseForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        superExpense={selectedSuperExpense}
      />

      {/* Detalle de egreso */}
      {selectedSuperExpense && (
        <SuperExpenseDetail
          open={openDetail}
          onClose={handleCloseDetail}
          superExpense={selectedSuperExpense}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este egreso? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperExpensesList;

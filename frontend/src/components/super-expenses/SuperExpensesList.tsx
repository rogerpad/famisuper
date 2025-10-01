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
  CircularProgress
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
import { formatCurrency, formatDate } from '../../utils/formatters';
import SuperExpenseForm from './SuperExpenseForm';
import SuperExpenseDetail from './SuperExpenseDetail';

const SuperExpensesList: React.FC = () => {
  const { superExpenses, loading: isLoading, error, fetchSuperExpenses: refetch, deleteSuperExpense } = useSuperExpenses();
  const isError = !!error;
  const { hasPermission } = useAuth();
  
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSuperExpense, setSelectedSuperExpense] = useState<SuperExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Mantenemos filterType pero eliminamos setFilterType de la desestructuración para evitar la advertencia
  const [filterType] = useState<number | ''>('');
  const [filterDate, setFilterDate] = useState('');

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

  const filteredSuperExpenses = superExpenses?.filter(expense => {
    const matchesSearch = searchTerm === '' || 
      (expense.descripcionEgreso?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (expense.tipoEgreso?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesType = filterType === '' || expense.tipoEgresoId === filterType;
    
    const matchesDate = filterDate === '' || 
      (expense.fechaEgreso && String(expense.fechaEgreso).includes(filterDate));
    
    return matchesSearch && matchesType && matchesDate;
  }) || [];

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
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(expense)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
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

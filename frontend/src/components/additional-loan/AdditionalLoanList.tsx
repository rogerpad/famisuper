import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getAdditionalLoans, 
  deleteAdditionalLoan,
  AdditionalLoanData
} from '../../api/additional-loan/additionalLoanApi';
import { usePermissions } from '../../hooks/usePermissions';

const AdditionalLoanList: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const [loans, setLoans] = useState<AdditionalLoanData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Permisos
  const canView = hasPermission('ver_adic_presta');
  const canCreateEdit = hasPermission('crear_editar_adic_prest');
  const canDelete = hasPermission('eliminar_adic_prest');

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAdditionalLoans(true); // Solo cargar registros activos
      setLoans(data);
      setError(null);
    } catch (err) {
      console.error('[ADDITIONAL_LOAN_LIST] Error loading data:', err);
      setError('Error loading additional loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) {
      fetchData();
    }
  }, [canView]);

  // Formatear fecha
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      console.error('[ADDITIONAL_LOAN_LIST] Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (itemToDelete === null) return;
    
    try {
      await deleteAdditionalLoan(itemToDelete);
      setSnackbar({
        open: true,
        message: 'Additional loan deleted successfully',
        severity: 'success'
      });
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('[ADDITIONAL_LOAN_LIST] Error deleting:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting additional loan',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Cancelar eliminación
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Navegar a la página de detalle
  const handleViewClick = (id: number) => {
    navigate(`/adicionales-prestamos/detalle/${id}`);
  };

  // Navegar a la página de edición
  const handleEditClick = (id: number) => {
    navigate(`/adicionales-prestamos/editar/${id}`);
  };

  // Navegar a la página de creación
  const handleAddClick = () => {
    navigate('/adicionales-prestamos/nuevo');
  };

  if (!canView) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" color="error">
          No tiene permisos para ver adicionales/préstamos
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Adicionales y Préstamos</Typography>
        {canCreateEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Nuevo Adicional/Préstamo
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : loans.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No hay adicionales/préstamos registrados
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Acuerdo</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : 'N/A'}
                  </TableCell>
                  <TableCell>{item.acuerdo}</TableCell>
                  <TableCell>{item.origen}</TableCell>
                  <TableCell>L. {item.monto.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(item.fecha)}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.activo ? 'Activo' : 'Inactivo'}
                      color={item.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewClick(item.id!)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {canCreateEdit && (
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(item.id!)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {canDelete && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(item.id!)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
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
            ¿Está seguro que desea eliminar este adicional/préstamo? Esta acción no se puede deshacer.
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

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdditionalLoanList;

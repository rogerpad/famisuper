import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePaymentMethods, hasPaymentMethodAdminPermission } from '../../api/payment-methods/paymentMethodsApi';
import { PaymentMethod } from '../../api/payment-methods/types';
import { useAuth } from '../../contexts/AuthContext';
import PaymentMethodForm from './PaymentMethodForm';

const PaymentMethodsList: React.FC = () => {
  const { paymentMethods, loading, error, fetchPaymentMethods, deletePaymentMethod, togglePaymentMethodActive } = usePaymentMethods();
  const { state } = useAuth();
  const [openForm, setOpenForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  // Obtener los permisos del usuario como un array de códigos
  const userPermissions = Object.keys(state.permissions).filter(key => state.permissions[key]);
  const canManagePaymentMethods = hasPaymentMethodAdminPermission(userPermissions);

  const handleAddClick = () => {
    setSelectedPaymentMethod(null);
    setOpenForm(true);
  };

  const handleEditClick = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setOpenForm(true);
  };

  const handleDeleteClick = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setOpenDeleteDialog(true);
  };

  const handleCloseForm = (success?: boolean, isNew?: boolean) => {
    setOpenForm(false);
    setSelectedPaymentMethod(null);
    
    if (success) {
      // Mostrar mensaje de éxito
      setSnackbar({
        open: true,
        message: isNew ? 'Forma de pago creada exitosamente' : 'Forma de pago actualizada exitosamente',
        severity: 'success',
      });
      
      // Refrescar la lista de formas de pago
      fetchPaymentMethods(showInactive);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPaymentMethod(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedPaymentMethod) {
      try {
        await deletePaymentMethod(selectedPaymentMethod.id);
        setOpenDeleteDialog(false);
        setSelectedPaymentMethod(null);
        
        // Mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: 'Forma de pago eliminada exitosamente',
          severity: 'success',
        });
        
        // Refrescar la lista de formas de pago
        fetchPaymentMethods(showInactive);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar la forma de pago',
          severity: 'error',
        });
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await togglePaymentMethodActive(id);
      
      // Mostrar mensaje de éxito
      setSnackbar({
        open: true,
        message: 'Estado de forma de pago actualizado exitosamente',
        severity: 'success',
      });
      
      // Refrescar la lista de formas de pago
      fetchPaymentMethods(showInactive);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado de la forma de pago',
        severity: 'error',
      });
    }
  };

  const handleToggleShowInactive = () => {
    setShowInactive(!showInactive);
    fetchPaymentMethods(!showInactive);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  if (loading) return <Typography>Cargando formas de pago...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const filteredPaymentMethods = showInactive
    ? paymentMethods
    : paymentMethods.filter(pm => pm.activo);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Formas de Pago
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={!showInactive}
                onChange={handleToggleShowInactive}
                color="primary"
              />
            }
            label="Solo activos"
          />
          {canManagePaymentMethods && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{ ml: 2 }}
            >
              Nueva Forma de Pago
            </Button>
          )}
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              {canManagePaymentMethods && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPaymentMethods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManagePaymentMethods ? 7 : 6} align="center">
                  No hay formas de pago registradas
                </TableCell>
              </TableRow>
            ) : (
              filteredPaymentMethods.map((paymentMethod) => (
                <TableRow key={paymentMethod.id}>
                  <TableCell>{paymentMethod.id}</TableCell>
                  <TableCell>{paymentMethod.nombre}</TableCell>
                  <TableCell>{paymentMethod.descripcion || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={paymentMethod.activo ? 'Activo' : 'Inactivo'}
                      color={paymentMethod.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>

                  {canManagePaymentMethods && (
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(paymentMethod)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(paymentMethod)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario para crear/editar formas de pago */}
      <PaymentMethodForm
        open={openForm}
        onClose={handleCloseForm}
        paymentMethod={selectedPaymentMethod}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar la forma de pago "{selectedPaymentMethod?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes de éxito o error */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentMethodsList;

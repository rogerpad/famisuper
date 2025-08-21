import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { usePaymentDocuments } from '../../api/payment-documents/paymentDocumentsApi';
import { PaymentDocument } from '../../api/payment-documents/types';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const PaymentDocumentsList: React.FC = () => {
  const {
    paymentDocuments,
    isLoadingPaymentDocuments,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
    refetchPaymentDocuments,
  } = usePaymentDocuments();

  const { hasPermission } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const canManagePaymentDocuments = hasPermission('admin_documentos_pago');

  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  const handleOpenForm = (paymentDocument?: PaymentDocument) => {
    if (paymentDocument) {
      setIsEditing(true);
      setSelectedId(paymentDocument.id);
      setFormData({
        nombre: paymentDocument.nombre,
        descripcion: paymentDocument.descripcion || '',
      });
    } else {
      setIsEditing(false);
      setSelectedId(null);
      setFormData({
        nombre: '',
        descripcion: '',
      });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData({
      nombre: '',
      descripcion: '',
    });
  };

  const handleOpenDeleteDialog = (id: number) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedId) {
        const result = await handleUpdate(selectedId, formData);
        if (result.success) {
          enqueueSnackbar('Documento de pago actualizado correctamente', { variant: 'success' });
          handleCloseForm();
        } else {
          enqueueSnackbar('Error al actualizar el documento de pago', { variant: 'error' });
        }
      } else {
        const result = await handleCreate(formData);
        if (result.success) {
          enqueueSnackbar('Documento de pago creado correctamente', { variant: 'success' });
          handleCloseForm();
        } else {
          enqueueSnackbar('Error al crear el documento de pago', { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Error en la operación:', error);
      enqueueSnackbar('Error en la operación', { variant: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedId) {
      try {
        const result = await handleDelete(selectedId);
        if (result.success) {
          enqueueSnackbar('Documento de pago eliminado correctamente', { variant: 'success' });
        } else {
          enqueueSnackbar('Error al eliminar el documento de pago', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        enqueueSnackbar('Error al eliminar el documento de pago', { variant: 'error' });
      }
      handleCloseDeleteDialog();
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const result = await handleToggleStatus(id);
      if (result.success) {
        enqueueSnackbar('Estado actualizado correctamente', { variant: 'success' });
      } else {
        enqueueSnackbar('Error al actualizar el estado', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      enqueueSnackbar('Error al actualizar el estado', { variant: 'error' });
    }
  };

  if (isLoadingPaymentDocuments) {
    return <Typography>Cargando documentos de pago...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Documentos de Pago</Typography>
        {canManagePaymentDocuments && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Documento de Pago
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              {canManagePaymentDocuments && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentDocuments?.map((paymentDocument: PaymentDocument) => (
              <TableRow key={paymentDocument.id}>
                <TableCell>{paymentDocument.nombre}</TableCell>
                <TableCell>{paymentDocument.descripcion || '-'}</TableCell>
                <TableCell>
                  {paymentDocument.activo ? (
                    <Typography color="primary">Activo</Typography>
                  ) : (
                    <Typography color="error">Inactivo</Typography>
                  )}
                </TableCell>
                {canManagePaymentDocuments && (
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenForm(paymentDocument)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(paymentDocument.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={paymentDocument.activo ? 'Desactivar' : 'Activar'}>
                      <IconButton
                        color={paymentDocument.activo ? 'error' : 'success'}
                        onClick={() => handleToggleActive(paymentDocument.id)}
                      >
                        {paymentDocument.activo ? <CloseIcon /> : <CheckIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!paymentDocuments?.length && (
              <TableRow>
                <TableCell colSpan={canManagePaymentDocuments ? 4 : 3} align="center">
                  No hay documentos de pago registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario para crear/editar */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {isEditing ? 'Editar Documento de Pago' : 'Nuevo Documento de Pago'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre"
              type="text"
              fullWidth
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Descripción"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este documento de pago? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentDocumentsList;

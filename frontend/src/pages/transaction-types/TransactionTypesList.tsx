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
import transactionTypesApi, { TransactionType } from '../../api/transaction-types/transactionTypesApi';
// Importación relativa al archivo actual
import TransactionTypeForm from './TransactionTypeForm';

const TransactionTypesList: React.FC = () => {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [transactionTypeToDelete, setTransactionTypeToDelete] = useState<TransactionType | null>(null);

  // Obtener la lista de tipos de transacción
  const { data: transactionTypes, isLoading, error } = useQuery({
    queryKey: ['transactionTypes'],
    queryFn: transactionTypesApi.getAll,
  });

  // Mutación para eliminar un tipo de transacción
  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactionTypes'] });
      setOpenDeleteDialog(false);
      setTransactionTypeToDelete(null);
    },
  });

  // Manejadores de eventos
  const handleOpenForm = (transactionType: TransactionType | null = null) => {
    setSelectedTransactionType(transactionType);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedTransactionType(null);
  };

  const handleOpenDeleteDialog = (transactionType: TransactionType) => {
    setTransactionTypeToDelete(transactionType);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTransactionTypeToDelete(null);
  };

  const handleDeleteTransactionType = () => {
    if (transactionTypeToDelete) {
      deleteMutation.mutate(transactionTypeToDelete.id);
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
    console.error('Error al cargar tipos de transacción:', error);
    return (
      <Box m={2}>
        <Alert severity="error">
          Error al cargar los tipos de transacción. Por favor, intente nuevamente.
          {error instanceof Error && (
            <Box mt={1}>
              <Typography variant="caption" color="error">
                Detalle: {error.message}
              </Typography>
            </Box>
          )}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Tipos de Transacción
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nuevo Tipo de Transacción
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactionTypes?.map((transactionType) => (
              <TableRow key={transactionType.id}>
                <TableCell>{transactionType.id}</TableCell>
                <TableCell>{transactionType.nombre}</TableCell>
                <TableCell>{transactionType.descripcion || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={transactionType.activo ? 'Activo' : 'Inactivo'}
                    color={transactionType.activo ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    aria-label="editar"
                    onClick={() => handleOpenForm(transactionType)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="eliminar"
                    onClick={() => handleOpenDeleteDialog(transactionType)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {transactionTypes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay tipos de transacción registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario de tipo de transacción (modal) */}
      <TransactionTypeForm
        open={openForm}
        onClose={handleCloseForm}
        transactionType={selectedTransactionType}
      />

      {/* Diálogo de confirmación para eliminar tipo de transacción */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el tipo de transacción "{transactionTypeToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteTransactionType}
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

export default TransactionTypesList;

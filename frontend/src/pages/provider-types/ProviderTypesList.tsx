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
import providerTypesApi, { ProviderType } from '../../api/provider-types/providerTypesApi';
import ProviderTypeForm from './ProviderTypeForm';

const ProviderTypesList: React.FC = () => {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState<ProviderType | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [providerTypeToDelete, setProviderTypeToDelete] = useState<ProviderType | null>(null);

  // Obtener la lista de tipos de proveedor
  const { data: providerTypes, isLoading, error } = useQuery({
    queryKey: ['providerTypes'],
    queryFn: providerTypesApi.getAll,
  });

  // Mutación para eliminar un tipo de proveedor
  const deleteMutation = useMutation({
    mutationFn: (id: number) => providerTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerTypes'] });
      setOpenDeleteDialog(false);
      setProviderTypeToDelete(null);
    },
  });

  // Manejadores de eventos
  const handleOpenForm = (providerType: ProviderType | null = null) => {
    setSelectedProviderType(providerType);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedProviderType(null);
  };

  const handleOpenDeleteDialog = (providerType: ProviderType) => {
    setProviderTypeToDelete(providerType);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setProviderTypeToDelete(null);
  };

  const handleDeleteProviderType = () => {
    if (providerTypeToDelete) {
      deleteMutation.mutate(providerTypeToDelete.id);
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
    console.error('Error al cargar tipos de proveedor:', error);
    return (
      <Box m={2}>
        <Alert severity="error">
          Error al cargar los tipos de proveedor. Por favor, intente nuevamente.
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
          Gestión de Tipos de Proveedor
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nuevo Tipo de Proveedor
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
            {providerTypes?.map((providerType) => (
              <TableRow key={providerType.id}>
                <TableCell>{providerType.id}</TableCell>
                <TableCell>{providerType.nombre}</TableCell>
                <TableCell>{providerType.descripcion || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={providerType.activo ? 'Activo' : 'Inactivo'}
                    color={providerType.activo ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    aria-label="editar"
                    onClick={() => handleOpenForm(providerType)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="eliminar"
                    onClick={() => handleOpenDeleteDialog(providerType)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {providerTypes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay tipos de proveedor registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario de tipo de proveedor (modal) */}
      <ProviderTypeForm
        open={openForm}
        onClose={handleCloseForm}
        providerType={selectedProviderType}
      />

      {/* Diálogo de confirmación para eliminar tipo de proveedor */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el tipo de proveedor "{providerTypeToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteProviderType}
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

export default ProviderTypesList;

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import providersApi, { Provider } from '../../api/providers/providersApi';
import providerTypesApi from '../../api/provider-types/providerTypesApi';
import ProviderForm from './ProviderForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ProvidersList: React.FC = () => {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Obtener la lista de proveedores
  const { data: providers, isLoading, error } = useQuery({
    queryKey: ['providers', typeFilter],
    queryFn: () => typeFilter 
      ? providersApi.getByType(parseInt(typeFilter))
      : providersApi.getAll(),
  });

  // Obtener la lista de tipos de proveedor para el filtro
  const { data: providerTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['providerTypes'],
    queryFn: providerTypesApi.getAll,
  });

  // Mutación para eliminar un proveedor
  const deleteMutation = useMutation({
    mutationFn: (id: number) => providersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      setOpenDeleteDialog(false);
      setProviderToDelete(null);
    },
  });

  // Manejadores de eventos
  const handleOpenForm = (provider: Provider | null = null) => {
    setSelectedProvider(provider);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedProvider(null);
  };

  const handleOpenDeleteDialog = (provider: Provider) => {
    setProviderToDelete(provider);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setProviderToDelete(null);
  };

  const handleDeleteProvider = () => {
    if (providerToDelete) {
      deleteMutation.mutate(providerToDelete.id);
    }
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
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
    console.error('Error al cargar proveedores:', error);
    return (
      <Box m={2}>
        <Alert severity="error">
          Error al cargar los proveedores. Por favor, intente nuevamente.
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
          Gestión de Proveedores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      {/* Filtro por tipo de proveedor */}
      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="type-filter-label">Filtrar por Tipo</InputLabel>
          <Select
            labelId="type-filter-label"
            id="type-filter"
            value={typeFilter}
            label="Filtrar por Tipo"
            onChange={handleTypeFilterChange}
            displayEmpty
          >
            <MenuItem value="">Todos los tipos</MenuItem>
            {providerTypes?.map((type) => (
              <MenuItem key={type.id} value={type.id.toString()}>
                {type.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>RTN</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers?.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>{provider.id}</TableCell>
                <TableCell>{provider.nombre}</TableCell>
                <TableCell>{provider.tipoProveedor?.nombre || '-'}</TableCell>
                <TableCell>{provider.rtn || '-'}</TableCell>
                <TableCell>{provider.telefono || '-'}</TableCell>
                <TableCell>{provider.contacto || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={provider.activo ? 'Activo' : 'Inactivo'}
                    color={provider.activo ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {provider.fechaRegistro 
                    ? format(new Date(provider.fechaRegistro), 'dd/MM/yyyy', { locale: es })
                    : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    aria-label="editar"
                    onClick={() => handleOpenForm(provider)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="eliminar"
                    onClick={() => handleOpenDeleteDialog(provider)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {providers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay proveedores registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario de proveedor (modal) */}
      <ProviderForm
        open={openForm}
        onClose={handleCloseForm}
        provider={selectedProvider}
      />

      {/* Diálogo de confirmación para eliminar proveedor */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el proveedor "{providerToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteProvider}
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

export default ProvidersList;

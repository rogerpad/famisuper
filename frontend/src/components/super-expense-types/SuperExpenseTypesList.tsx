import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSuperExpenseTypes } from '../../api/super-expense-types/superExpenseTypesApi';
import { SuperExpenseType } from '../../api/super-expense-types/types';

// Interfaz para el formulario de tipo de egreso
interface SuperExpenseTypeFormData {
  nombre: string;
  descripcion: string;
}

const initialFormData: SuperExpenseTypeFormData = {
  nombre: '',
  descripcion: ''
};

const SuperExpenseTypesList: React.FC = () => {
  // Estados
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<SuperExpenseTypeFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Obtener datos de tipos de egresos usando el hook
  const { 
    types,
    isLoading, 
    isError, 
    error,
    createType,
    updateType,
    deleteType,
    toggleTypeStatus,
    refetch 
  } = useSuperExpenseTypes();

  // Handlers
  const handleOpenDialog = (type?: SuperExpenseType) => {
    if (type) {
      setFormData({
        nombre: type.nombre,
        descripcion: type.descripcion || ''
      });
      setEditingId(type.id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  // Manejador para inputs de texto
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateType({ id: editingId, data: formData });
        setSnackbar({
          open: true,
          message: 'Tipo de egreso actualizado correctamente',
          severity: 'success'
        });
      } else {
        await createType(formData);
        setSnackbar({
          open: true,
          message: 'Tipo de egreso creado correctamente',
          severity: 'success'
        });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error('Error al guardar tipo de egreso:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este tipo de egreso?')) {
      try {
        await deleteType(id);
        setSnackbar({
          open: true,
          message: 'Tipo de egreso eliminado correctamente',
          severity: 'success'
        });
        refetch();
      } catch (error) {
        console.error('Error al eliminar tipo de egreso:', error);
        setSnackbar({
          open: true,
          message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`,
          severity: 'error'
        });
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleTypeStatus(id);
      setSnackbar({
        open: true,
        message: 'Estado del tipo de egreso actualizado correctamente',
        severity: 'success'
      });
      refetch();
    } catch (error) {
      console.error('Error al cambiar estado del tipo de egreso:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Renderizado
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error al cargar tipos de egresos: {error instanceof Error ? error.message : 'Desconocido'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tipos de Egresos del Super
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Tipo de Egreso
        </Button>
      </Box>

      {types.length === 0 ? (
        <Typography>No hay tipos de egresos registrados</Typography>
      ) : (
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
              {types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.id}</TableCell>
                  <TableCell>{type.nombre}</TableCell>
                  <TableCell>{type.descripcion}</TableCell>
                  <TableCell>
                    <Chip 
                      label={type.activo ? 'Activo' : 'Inactivo'} 
                      color={type.activo ? 'success' : 'default'}
                      onClick={() => handleToggleStatus(type.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog(type)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(type.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo para crear/editar tipos de egresos */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Tipo de Egreso' : 'Nuevo Tipo de Egreso'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleTextInputChange}
              fullWidth
              required
            />
            <TextField
              name="descripcion"
              label="Descripción"
              value={formData.descripcion}
              onChange={handleTextInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.nombre}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperExpenseTypesList;

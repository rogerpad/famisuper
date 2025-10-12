import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usePermissions } from '../../api/permisos/permisosApi';

// Importamos la interfaz Permiso desde permisosApi
import { Permiso } from '../../api/permisos/permisosApi';

// Interfaz para el formulario de permiso
interface PermisoFormData {
  nombre: string;
  codigo: string;
  descripcion: string | null;
  modulo: string;
  nuevoModulo: string; // Campo para almacenar el nombre del nuevo módulo
}

const initialFormData: PermisoFormData = {
  nombre: '',
  codigo: '',
  descripcion: '',
  modulo: '',
  nuevoModulo: ''
};

const PermissionsList: React.FC = () => {
  // Estados
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<PermisoFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Obtener datos de permisos usando el hook
  const { 
    data: permisosByModulo,
    isLoading, 
    isError, 
    error,
    createPermiso,
    updatePermiso,
    deletePermiso,
    refetch 
  } = usePermissions();

  // Agrupar permisos por módulo para mostrarlos
  const modulos = permisosByModulo ? Object.keys(permisosByModulo) : [];
  
  // Asegurar que permisosByModulo no sea undefined
  const permisosPorModulo = permisosByModulo || {};

  // Handlers
  const handleOpenDialog = (permiso?: Permiso) => {
    if (permiso) {
      setFormData({
        nombre: permiso.nombre,
        codigo: permiso.codigo,
        descripcion: permiso.descripcion,
        modulo: permiso.modulo,
        nuevoModulo: '' // Inicializamos el campo nuevoModulo vacío al editar
      });
      setEditingId(permiso.id);
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
  
  // Manejador específico para Select
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Si se seleccionó "nuevo módulo", usar el valor de nuevoModulo
      // y eliminar el campo nuevoModulo para que no se envíe al backend
      const dataToSubmit = {
        nombre: formData.nombre,
        codigo: formData.codigo,
        descripcion: formData.descripcion,
        modulo: formData.modulo === 'nuevo' ? formData.nuevoModulo : formData.modulo
      };
      
      if (editingId) {
        await updatePermiso(editingId, dataToSubmit);
        setSnackbar({
          open: true,
          message: 'Permiso actualizado correctamente',
          severity: 'success'
        });
      } else {
        await createPermiso(dataToSubmit);
        setSnackbar({
          open: true,
          message: 'Permiso creado correctamente',
          severity: 'success'
        });
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error('Error al guardar permiso:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este permiso?')) {
      try {
        await deletePermiso(id);
        setSnackbar({
          open: true,
          message: 'Permiso eliminado correctamente',
          severity: 'success'
        });
        refetch();
      } catch (error) {
        console.error('Error al eliminar permiso:', error);
        setSnackbar({
          open: true,
          message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`,
          severity: 'error'
        });
      }
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
          Error al cargar permisos: {error instanceof Error ? error.message : 'Desconocido'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Permisos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Permiso
        </Button>
      </Box>

      {modulos.length === 0 ? (
        <Typography>No hay permisos registrados</Typography>
      ) : (
        modulos.map(modulo => (
          <Box key={modulo} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Módulo: {modulo}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permisosPorModulo[modulo]?.map((permiso) => (
                    <TableRow key={permiso.id}>
                      <TableCell>{permiso.id}</TableCell>
                      <TableCell>{permiso.nombre}</TableCell>
                      <TableCell>{permiso.codigo}</TableCell>
                      <TableCell>{permiso.descripcion}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(permiso)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(permiso.id)}
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
          </Box>
        ))
      )}

      {/* Diálogo para crear/editar permisos */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Editar Permiso' : 'Nuevo Permiso'}
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
              name="codigo"
              label="Código"
              value={formData.codigo}
              onChange={handleTextInputChange}
              fullWidth
              required
              helperText="Código único para identificar el permiso en el sistema"
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
            <FormControl fullWidth>
              <InputLabel>Módulo</InputLabel>
              <Select
                name="modulo"
                value={formData.modulo}
                label="Módulo"
                onChange={handleSelectChange}
              >
                {modulos.map(modulo => (
                  <MenuItem key={modulo} value={modulo}>
                    {modulo}
                  </MenuItem>
                ))}
                <MenuItem value="nuevo">
                  <em>Nuevo módulo...</em>
                </MenuItem>
              </Select>
            </FormControl>
            {formData.modulo === 'nuevo' && (
              <TextField
                name="nuevoModulo"
                label="Nombre del nuevo módulo"
                value={formData.nuevoModulo}
                onChange={handleTextInputChange}
                fullWidth
                required
                autoFocus
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.nombre || !formData.codigo || !formData.modulo}
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

export default PermissionsList;

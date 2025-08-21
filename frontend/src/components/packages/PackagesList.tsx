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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { usePackages } from '../../api/packages/packagesApi';
import { Package } from '../../api/packages/types';
import { useSnackbar } from 'notistack';

const PackagesList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error, fetchPackages, deletePackage } = usePackages();
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  // Cargar paquetes al montar el componente
  useEffect(() => {
    loadPackages();
  }, []);

  // Filtrar paquetes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = packages.filter(pkg => 
        pkg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(packages);
    }
  }, [searchTerm, packages]);

  // Función para cargar los paquetes
  const loadPackages = async () => {
    try {
      const data = await fetchPackages();
      setPackages(data);
      setFilteredPackages(data);
    } catch (err) {
      console.error('Error al cargar paquetes:', err);
      enqueueSnackbar('Error al cargar la lista de paquetes', { variant: 'error' });
    }
  };

  // Función para abrir el diálogo de confirmación de eliminación
  const handleDeleteClick = (pkg: Package) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  // Función para confirmar la eliminación
  const handleDeleteConfirm = async () => {
    if (packageToDelete) {
      try {
        const success = await deletePackage(packageToDelete.id);
        if (success) {
          enqueueSnackbar('Paquete eliminado correctamente', { variant: 'success' });
          loadPackages(); // Recargar la lista
        } else {
          enqueueSnackbar('Error al eliminar el paquete', { variant: 'error' });
        }
      } catch (err) {
        console.error('Error al eliminar paquete:', err);
        enqueueSnackbar('Error al eliminar el paquete', { variant: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setPackageToDelete(null);
  };

  // Función para cancelar la eliminación
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPackageToDelete(null);
  };

  // Función para navegar a la página de creación
  const handleCreateClick = () => {
    navigate('/packages/new');
  };

  // Función para navegar a la página de edición
  const handleEditClick = (id: number) => {
    navigate(`/packages/edit/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Paquetes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Nuevo Paquete
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar paquetes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Typography>Cargando paquetes...</Typography>
      ) : error ? (
        <Typography color="error">Error: {error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Línea Telefónica</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>{pkg.id}</TableCell>
                    <TableCell>{pkg.nombre}</TableCell>
                    <TableCell>{pkg.descripcion}</TableCell>
                    <TableCell>₡{Number(pkg.precio).toFixed(2)}</TableCell>
                    <TableCell>{pkg.telefonicaId}</TableCell>
                    <TableCell>
                      <Chip 
                        label={pkg.activo ? 'Activo' : 'Inactivo'} 
                        color={pkg.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditClick(pkg.id)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(pkg)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron paquetes
                  </TableCell>
                </TableRow>
              )}
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
            ¿Está seguro que desea eliminar el paquete "{packageToDelete?.nombre}"?
            Esta acción no se puede deshacer.
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
    </Box>
  );
};

export default PackagesList;

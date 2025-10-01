import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { usePhoneLines } from '../../api/phone-lines/phoneLinesApi';
import { PhoneLine } from '../../api/phone-lines/types';

const PackagesList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error, fetchPackages, deletePackage } = usePackages();
  const { loading: loadingPhoneLines, error: phoneLineError, fetchPhoneLines } = usePhoneLines();
  
  // Referencia para controlar si ya se está navegando
  const isNavigatingRef = useRef(false);
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [phoneLines, setPhoneLines] = useState<PhoneLine[]>([]);
  const [phoneLineMap, setPhoneLineMap] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  // Cargar paquetes y líneas telefónicas al montar el componente
  useEffect(() => {
    loadPackages();
    loadPhoneLines();
  }, []);

  // Filtrar paquetes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = packages.filter(pkg => 
        pkg.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.descripcion ? pkg.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) : false)
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

  // Función para cargar las líneas telefónicas
  const loadPhoneLines = async () => {
    try {
      const data = await fetchPhoneLines();
      setPhoneLines(data);
      
      // Crear un mapeo de ID a nombre para uso rápido en la tabla
      const map: Record<number, string> = {};
      data.forEach(line => {
        map[line.id] = line.nombre;
      });
      setPhoneLineMap(map);
    } catch (err) {
      console.error('Error al cargar líneas telefónicas:', err);
      enqueueSnackbar('Error al cargar las líneas telefónicas', { variant: 'error' });
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
  const handleCreateClick = (e: React.MouseEvent) => {
    // Prevenir comportamiento predeterminado para evitar cualquier navegación automática
    e.preventDefault();
    
    // Prevenir múltiples navegaciones o clics rápidos
    if (isNavigatingRef.current) {
      console.log('Navegación ya en progreso, ignorando clic adicional');
      return;
    }
    
    try {
      console.log('Iniciando navegación a formulario de nuevo paquete');
      isNavigatingRef.current = true;
      
      // Navegación directa sin setTimeout
      navigate('/packages/new');
      
      // Restaurar el estado después de un tiempo razonable
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    } catch (error) {
      console.error('Error al navegar al formulario de nuevo paquete:', error);
      enqueueSnackbar('Error al abrir el formulario de nuevo paquete', { variant: 'error' });
      isNavigatingRef.current = false;
    }
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
          onClick={(e) => handleCreateClick(e)}
          data-testid="new-package-button"
          sx={{ pointerEvents: isNavigatingRef.current ? 'none' : 'auto' }}
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

      {loading || loadingPhoneLines ? (
        <Typography>Cargando paquetes...</Typography>
      ) : error || phoneLineError ? (
        <Typography color="error">Error: {error || phoneLineError}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Línea Telefónica</TableCell>
                <TableCell>Descripción</TableCell>
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
                    <TableCell>L. {Number(pkg.precio).toFixed(2)}</TableCell>
                    <TableCell>{phoneLineMap[pkg.telefonicaId] || 'No disponible'}</TableCell>
                    <TableCell>{pkg.descripcion}</TableCell>
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

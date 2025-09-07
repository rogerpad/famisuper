import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useConteoBilletesSuper } from '../../api/conteo-billetes-super/conteoBilletesSuperApi';
import { ConteoBilletesSuper } from '../../api/conteo-billetes-super/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

const ConteoBilletesSuperList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const {
    conteoBilletesSuper,
    loading,
    error,
    fetchConteoBilletesSuper,
    deleteConteoBilletesSuper,
  } = useConteoBilletesSuper();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conteoToDelete, setConteoToDelete] = useState<number | null>(null);

  // Verificar permisos
  const canCreate = !!state.permissions['crear_editar_conteo_super'];
  const canEdit = !!state.permissions['crear_editar_conteo_super'];
  const canDelete = !!state.permissions['eliminar_conteo_super'];

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchConteoBilletesSuper();
  }, [fetchConteoBilletesSuper]);

  // Manejar creación de nuevo conteo
  const handleCreate = () => {
    navigate('/conteo-billetes-super/new');
  };

  // Manejar edición de conteo
  const handleEdit = (id: number) => {
    navigate(`/conteo-billetes-super/edit/${id}`);
  };

  // Manejar visualización de conteo
  const handleView = (id: number) => {
    navigate(`/conteo-billetes-super/view/${id}`);
  };

  // Manejar eliminación de conteo
  const handleDelete = (id: number) => {
    setConteoToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (conteoToDelete) {
      await deleteConteoBilletesSuper(conteoToDelete);
      setDeleteDialogOpen(false);
      setConteoToDelete(null);
    }
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setConteoToDelete(null);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <Box>
      {/* Se ha eliminado el botón 'Nuevo Conteo' de esta vista */}

      {loading ? (
        <Typography>Cargando datos...</Typography>
      ) : error ? (
        <Typography color="error">Error: {error}</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Total General</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conteoBilletesSuper.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay conteos registrados
                  </TableCell>
                </TableRow>
              ) : (
                conteoBilletesSuper.map((conteo: ConteoBilletesSuper) => (
                  <TableRow key={conteo.id}>
                    <TableCell>{conteo.id}</TableCell>
                    <TableCell>
                      {conteo.usuario
                        ? `${conteo.usuario.nombre} ${conteo.usuario.apellido || ''}`
                        : `Usuario ID: ${conteo.usuarioId}`}
                    </TableCell>
                    <TableCell>{formatDate(conteo.fecha)}</TableCell>
                    <TableCell align="right">L {(typeof conteo.totalGeneral === 'number' ? conteo.totalGeneral : parseFloat(String(conteo.totalGeneral || 0))).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          color="primary"
                          onClick={() => handleView(conteo.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {canEdit && (
                        <Tooltip title="Editar">
                          <IconButton
                            color="secondary"
                            onClick={() => handleEdit(conteo.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {canDelete && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(conteo.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este conteo de efectivo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConteoBilletesSuperList;

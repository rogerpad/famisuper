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
import { useSuperBillCount } from '../../api/super-bill-count/superBillCountApi';
import { SuperBillCount } from '../../api/super-bill-count/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';

const SuperBillCountList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { turnosActivos } = useTurno();
  const {
    superBillCounts,
    loading,
    error,
    fetchSuperBillCounts,
    deleteSuperBillCount,
  } = useSuperBillCount();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countToDelete, setCountToDelete] = useState<number | null>(null);

  // Verificar permisos
  const canCreate = !!state.permissions['crear_editar_conteo_super'];
  const canEdit = !!state.permissions['crear_editar_conteo_super'];
  const canDelete = !!state.permissions['eliminar_conteo_super'];

  // Cargar datos al montar el componente (solo registros activos)
  useEffect(() => {
    fetchSuperBillCounts(true);
  }, [fetchSuperBillCounts]);

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
    setCountToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (countToDelete) {
      await deleteSuperBillCount(countToDelete);
      setDeleteDialogOpen(false);
      setCountToDelete(null);
    }
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setCountToDelete(null);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Obtener el cajaNumero del turno activo del usuario
  const cajaNumeroActual = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
  console.log('[SuperBillCountList] Caja número del turno activo:', cajaNumeroActual);
  console.log('[SuperBillCountList] Total registros antes de filtrar:', superBillCounts.length);

  // Filtrar por caja y estado activo
  const filteredCounts = superBillCounts.filter(count => {
    console.log('[SuperBillCountList] Registro:', { id: count.id, cajaNumero: count.cajaNumero, activo: count.activo, cajaNumeroActual });
    
    // Filtrar por estado activo
    const matchesActivo = count.activo === true;
    
    // Filtrar por caja ESTRICTAMENTE: debe tener cajaNumero y coincidir con el turno activo
    const matchesCaja = !cajaNumeroActual || count.cajaNumero === cajaNumeroActual;
    
    console.log('[SuperBillCountList] Filtro:', { matchesActivo, matchesCaja, pasa: matchesActivo && matchesCaja });
    return matchesActivo && matchesCaja;
  });
  
  console.log('[SuperBillCountList] Total registros después de filtrar:', filteredCounts.length);

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
              {filteredCounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay conteos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredCounts.map((count: SuperBillCount) => (
                  <TableRow key={count.id}>
                    <TableCell>{count.id}</TableCell>
                    <TableCell>
                      {count.usuario
                        ? `${count.usuario.nombre} ${count.usuario.apellido || ''}`
                        : `Usuario ID: ${count.usuarioId}`}
                    </TableCell>
                    <TableCell>{formatDate(count.fecha)}</TableCell>
                    <TableCell align="right">L {(typeof count.totalGeneral === 'number' ? count.totalGeneral : parseFloat(String(count.totalGeneral || 0))).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          color="primary"
                          onClick={() => handleView(count.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {canEdit && (
                        <Tooltip title="Editar">
                          <IconButton
                            color="secondary"
                            onClick={() => handleEdit(count.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {canDelete && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(count.id)}
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

export default SuperBillCountList;


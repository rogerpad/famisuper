import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBalanceFlows } from '../../api/balance-flows/balanceFlowsApi';
import { BalanceFlow } from '../../api/balance-flows/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import BalanceFlowForm from './BalanceFlowForm';
import { format } from 'date-fns';

const BalanceFlowsList: React.FC = () => {
  const { 
    balanceFlows, 
    loading, 
    error, 
    fetchBalanceFlows, 
    deleteBalanceFlow 
  } = useBalanceFlows();
  const { hasPermission } = useAuth();
  const { turnosActivos } = useTurno();

  const [openForm, setOpenForm] = useState(false);
  const [selectedBalanceFlow, setSelectedBalanceFlow] = useState<BalanceFlow | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [balanceFlowToDelete, setBalanceFlowToDelete] = useState<number | null>(null);

  // Verificar permisos
  const canEdit = hasPermission('crear_editar_flujo');
  const canDelete = hasPermission('eliminar_flujo');

  useEffect(() => {
    fetchBalanceFlows(true);
  }, [fetchBalanceFlows]);

  const handleOpenForm = (balanceFlow?: BalanceFlow) => {
    if (balanceFlow) {
      setSelectedBalanceFlow(balanceFlow);
    } else {
      setSelectedBalanceFlow(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = (refreshData: boolean = false) => {
    setOpenForm(false);
    setSelectedBalanceFlow(null);
    if (refreshData) {
      fetchBalanceFlows(true);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setBalanceFlowToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setBalanceFlowToDelete(null);
  };

  const handleDelete = async () => {
    if (balanceFlowToDelete !== null) {
      const success = await deleteBalanceFlow(balanceFlowToDelete);
      if (success) {
        handleCloseDeleteDialog();
      }
    }
  };

  // Formatear valores monetarios
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (loading && balanceFlows.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">Error al cargar los flujos de saldo: {error}</Typography>
      </Box>
    );
  }

  // Obtener el cajaNumero del turno activo del usuario
  const cajaNumeroActual = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
  console.log('[BalanceFlowsList] Caja número del turno activo:', cajaNumeroActual);

  // Filtrar por caja y estado activo
  const filteredBalanceFlows = balanceFlows.filter(flow => {
    // Filtrar por estado activo
    const matchesActivo = flow.activo === true;
    
    // Filtrar por caja ESTRICTAMENTE: debe coincidir con el turno activo
    const matchesCaja = !cajaNumeroActual || flow.cajaNumero === cajaNumeroActual;
    
    return matchesActivo && matchesCaja;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Flujos de Saldo</Typography>
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Flujo de Saldo
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Línea Telefónica</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Saldo Inicial</TableCell>
              <TableCell>Saldo Comprado</TableCell>
              <TableCell>Saldo Vendido</TableCell>
              <TableCell>Saldo Final</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBalanceFlows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No hay flujos de saldo registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredBalanceFlows.map((balanceFlow) => (
                <TableRow key={balanceFlow.id}>
                  <TableCell>{balanceFlow.id}</TableCell>
                  <TableCell>{balanceFlow.telefonica?.nombre || `ID: ${balanceFlow.telefonicaId}`}</TableCell>
                  <TableCell>{balanceFlow.nombre}</TableCell>
                  <TableCell>{formatCurrency(balanceFlow.saldoInicial)}</TableCell>
                  <TableCell>{formatCurrency(balanceFlow.saldoComprado)}</TableCell>
                  <TableCell>{formatCurrency(balanceFlow.saldoVendido)}</TableCell>
                  <TableCell>{formatCurrency(balanceFlow.saldoFinal)}</TableCell>
                  <TableCell>{format(new Date(balanceFlow.fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>{balanceFlow.activo ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell>
                    {canEdit && (
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenForm(balanceFlow)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(balanceFlow.id)}
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

      {/* Formulario de creación/edición */}
      <BalanceFlowForm
        open={openForm}
        balanceFlow={selectedBalanceFlow}
        onClose={handleCloseForm}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este flujo de saldo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BalanceFlowsList;

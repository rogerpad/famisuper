import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBalanceSales } from '../../api/balance-sales/balanceSalesApi';
import { usePackages } from '../../api/packages/packagesApi';
import { useBalanceFlows } from '../../api/balance-flows/balanceFlowsApi';
import { BalanceSale } from '../../api/balance-sales/types';
import { Package } from '../../api/packages/types';
import { useTurno } from '../../contexts/TurnoContext';

const BalanceSalesList: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, fetchBalanceSales, deleteBalanceSale } = useBalanceSales();
  const { loading: packagesLoading, fetchPackages } = usePackages();
  const { loading: balanceFlowsLoading, error: balanceFlowsError, recalcularSaldosVendidos } = useBalanceFlows();
  const { turnosActivos } = useTurno();
  const [balanceSales, setBalanceSales] = useState<BalanceSale[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageMap, setPackageMap] = useState<Record<number, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBalanceSaleId, setSelectedBalanceSaleId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  useEffect(() => {
    loadBalanceSales();
    loadPackages();
  }, []);
  
  const loadPackages = async () => {
    const packagesData = await fetchPackages();
    setPackages(packagesData);
    
    // Crear un mapeo de ID de paquete a nombre de paquete
    const packageMapping: Record<number, string> = {};
    packagesData.forEach(pkg => {
      packageMapping[pkg.id] = pkg.nombre;
    });
    setPackageMap(packageMapping);
  };

  const loadBalanceSales = async () => {
    const data = await fetchBalanceSales(true); // Solo cargar registros activos
    setBalanceSales(data);
  };

  const handleAddClick = () => {
    navigate('/balance-sales/new');
  };

  // Utilizamos useCallback para evitar recreaciones innecesarias de la función
  const handleEditClick = useCallback((id: number) => {
    // Evitamos navegaciones repetidas al mismo ID
    console.log(`[BalanceSalesList] Navegando a edición de venta ID: ${id}`);
    navigate(`/balance-sales/edit/${id}`);
  }, [navigate]);

  const handleDeleteClick = (id: number) => {
    setSelectedBalanceSaleId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBalanceSaleId !== null) {
      const success = await deleteBalanceSale(selectedBalanceSaleId);
      if (success) {
        loadBalanceSales();
      }
      setDeleteDialogOpen(false);
      setSelectedBalanceSaleId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedBalanceSaleId(null);
  };
  
  // Función para manejar el recálculo de saldos vendidos
  const handleRecalcularSaldos = async () => {
    try {
      const resultado = await recalcularSaldosVendidos();
      
      setSnackbarMessage(
        `Recálculo completado. Flujos actualizados: ${resultado.actualizados}, Errores: ${resultado.errores}`
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Recargar la lista de ventas para mostrar datos actualizados
      loadBalanceSales();
    } catch (error) {
      console.error('Error al recalcular saldos:', error);
      
      setSnackbarMessage(
        `Error al recalcular saldos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Función para cerrar el snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if ((loading && balanceSales.length === 0) || packagesLoading || balanceFlowsLoading) {
    return <Typography>Cargando ventas de saldo...</Typography>;
  }

  if (error || balanceFlowsError) {
    return <Typography color="error">Error: {error || balanceFlowsError}</Typography>;
  }

  // Obtener el cajaNumero del turno activo del usuario
  const cajaNumeroActual = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
  console.log('[BalanceSalesList] Caja número del turno activo:', cajaNumeroActual);

  // Filtrar por caja y estado activo
  const filteredBalanceSales = balanceSales.filter(sale => {
    // Filtrar por estado activo
    const matchesActivo = sale.activo === true;
    
    // Filtrar por caja ESTRICTAMENTE: debe coincidir con el turno activo
    const matchesCaja = !cajaNumeroActual || sale.cajaNumero === cajaNumeroActual;
    
    return matchesActivo && matchesCaja;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Ventas de Saldo</Typography>
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleRecalcularSaldos}
            sx={{ mr: 2 }}
          >
            Actualizar Flujos de Ventas
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Nueva Venta
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Paquete</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Línea Telefónica</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBalanceSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay ventas de saldo registradas
                </TableCell>
              </TableRow>
            ) : (
              filteredBalanceSales.map((balanceSale) => (
                <TableRow key={balanceSale.id}>
                  <TableCell>{balanceSale.id}</TableCell>
                  <TableCell>{balanceSale.paqueteId && packageMap[balanceSale.paqueteId] ? packageMap[balanceSale.paqueteId] : 'N/A'}</TableCell>
                  <TableCell>{balanceSale.cantidad}</TableCell>
                  <TableCell>L. {typeof balanceSale.monto === 'number' ? balanceSale.monto.toFixed(2) : Number(balanceSale.monto).toFixed(2)}</TableCell>
                  <TableCell>{balanceSale.telefonica?.nombre || 'N/A'}</TableCell>
                  <TableCell>{balanceSale.observacion || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(balanceSale.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>{balanceSale.usuario?.nombre || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(balanceSale.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(balanceSale.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar esta venta de saldo? Esta acción no se puede deshacer.
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
      
      {/* Snackbar para mostrar mensajes de éxito o error */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BalanceSalesList;

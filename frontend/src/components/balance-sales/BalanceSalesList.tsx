import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBalanceSales } from '../../api/balance-sales/balanceSalesApi';
import { BalanceSale } from '../../api/balance-sales/types';

const BalanceSalesList: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, fetchBalanceSales, deleteBalanceSale } = useBalanceSales();
  const [balanceSales, setBalanceSales] = useState<BalanceSale[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBalanceSaleId, setSelectedBalanceSaleId] = useState<number | null>(null);

  useEffect(() => {
    loadBalanceSales();
  }, []);

  const loadBalanceSales = async () => {
    const data = await fetchBalanceSales();
    setBalanceSales(data);
  };

  const handleAddClick = () => {
    navigate('/balance-sales/new');
  };

  const handleEditClick = (id: number) => {
    navigate(`/balance-sales/edit/${id}`);
  };

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

  if (loading && balanceSales.length === 0) {
    return <Typography>Cargando ventas de saldo...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Ventas de Saldo</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nueva Venta
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Línea Telefónica</TableCell>
              <TableCell>Flujo de Saldo</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balanceSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay ventas de saldo registradas
                </TableCell>
              </TableRow>
            ) : (
              balanceSales.map((balanceSale) => (
                <TableRow key={balanceSale.id}>
                  <TableCell>{balanceSale.id}</TableCell>
                  <TableCell>
                    {format(new Date(balanceSale.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>{balanceSale.usuario?.nombre || 'N/A'}</TableCell>
                  <TableCell>{balanceSale.telefonica?.nombre || 'N/A'}</TableCell>
                  <TableCell>{balanceSale.flujoSaldo?.nombre || 'N/A'}</TableCell>
                  <TableCell>{balanceSale.cantidad}</TableCell>
                  <TableCell>${typeof balanceSale.monto === 'number' ? balanceSale.monto.toFixed(2) : Number(balanceSale.monto).toFixed(2)}</TableCell>
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
    </Box>
  );
};

export default BalanceSalesList;

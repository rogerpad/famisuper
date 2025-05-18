import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../../api/api';

interface TransactionItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TransactionDetail {
  id: string;
  reference: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  notes: string;
  items: TransactionItem[];
}

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    // En un escenario real, estos datos vendrían de la API
    // Aquí simulamos los datos para la demostración
    setTimeout(() => {
      const demoTransaction: TransactionDetail = {
        id: id || '1',
        reference: `TRX-00${id}`,
        date: '2025-05-13',
        customerName: 'Juan Pérez',
        customerEmail: 'juan.perez@example.com',
        customerPhone: '+1234567890',
        amount: 1250.00,
        tax: 162.50,
        total: 1412.50,
        status: id === '3' || id === '5' || id === '8' ? 'Pendiente' : 'Completada',
        notes: 'Transacción realizada en tienda física.',
        items: [
          {
            id: '1',
            description: 'Producto A',
            quantity: 2,
            unitPrice: 250.00,
            total: 500.00
          },
          {
            id: '2',
            description: 'Producto B',
            quantity: 1,
            unitPrice: 350.00,
            total: 350.00
          },
          {
            id: '3',
            description: 'Producto C',
            quantity: 3,
            unitPrice: 133.33,
            total: 400.00
          }
        ]
      };
      
      setTransaction(demoTransaction);
      setLoading(false);
    }, 1000);
    
    // En una implementación real, usaríamos:
    // const fetchTransactionDetail = async () => {
    //   try {
    //     const response = await api.get(`/transactions/${id}`);
    //     setTransaction(response.data);
    //   } catch (error) {
    //     console.error('Error fetching transaction details:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchTransactionDetail();
  }, [id]);

  const handleCloseTransaction = async () => {
    setOpenDialog(false);
    setProcessingAction(true);
    
    // Simulamos el proceso de cierre
    setTimeout(() => {
      if (transaction) {
        setTransaction({
          ...transaction,
          status: 'Completada'
        });
      }
      setProcessingAction(false);
    }, 1500);
    
    // En una implementación real, usaríamos:
    // try {
    //   await api.patch(`/transactions/${id}/close`);
    //   setTransaction(prev => prev ? { ...prev, status: 'Completada' } : null);
    // } catch (error) {
    //   console.error('Error closing transaction:', error);
    // } finally {
    //   setProcessingAction(false);
    // }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Transacción no encontrada
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Detalle de Transacción
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            {transaction.reference}
          </Typography>
          <Chip
            label={transaction.status}
            color={transaction.status === 'Completada' ? 'success' : transaction.status === 'Pendiente' ? 'warning' : 'error'}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Información de la Transacción
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {transaction.date}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Monto:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    ${transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Impuesto:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    ${transaction.tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" fontWeight="bold">
                    ${transaction.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Notas:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {transaction.notes || 'Sin notas'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Información del Cliente
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Nombre:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {transaction.customerName}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Email:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {transaction.customerEmail}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Teléfono:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {transaction.customerPhone}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detalle de Productos
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Unitario</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transaction.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right">${item.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography variant="subtitle1">Subtotal:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1">${transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography variant="subtitle1">Impuesto:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1">${transaction.tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">${transaction.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/transactions/${id}/edit`)}
        >
          Editar
        </Button>
        
        {transaction.status === 'Pendiente' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            onClick={() => setOpenDialog(true)}
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Cerrar Transacción'}
          </Button>
        )}
        
        {transaction.status === 'Completada' && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloseIcon />}
            onClick={() => navigate(`/transactions/${id}/cancel`)}
          >
            Cancelar Transacción
          </Button>
        )}
      </Box>
      
      {/* Diálogo de confirmación */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>
          Confirmar Cierre de Transacción
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea cerrar esta transacción? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCloseTransaction} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionDetail;

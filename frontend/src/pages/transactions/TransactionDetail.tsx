import React, { useState } from 'react';
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
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transactionsApi from '../../api/transactions/transactionsApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TransactionForm from './TransactionForm';

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  // Consulta para obtener los detalles de la transacción
  const { data: transaction, isLoading, isError } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getById(Number(id)),
    enabled: !!id,
  });

  // Mutación para eliminar una transacción
  const deleteMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate('/transactions');
    },
  });

  const handleEdit = () => {
    setOpenForm(true);
  };

  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(Number(id));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !transaction) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No se pudo cargar la información de la transacción.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
        >
          Volver a Transacciones
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
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
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  ID
                </Typography>
                <Typography variant="body1">
                  {transaction.id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha
                </Typography>
                <Typography variant="body1">
                  {formatDate(transaction.fecha)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Hora
                </Typography>
                <Typography variant="body1">
                  {transaction.hora}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Valor
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  L{transaction.valor.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Información Adicional
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Usuario
                </Typography>
                <Typography variant="body1">
                  {transaction.usuario?.nombre || 'Administrador Sistema'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Agente
                </Typography>
                <Typography variant="body1">
                  {transaction.agente?.nombre || ''}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de Transacción
                </Typography>
                <Chip 
                  label={transaction.tipoTransaccion?.nombre || ''} 
                  color={getTransactionTypeColor(transaction.tipoTransaccion?.nombre || '')} 
                  size="small" 
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Observación
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              {transaction.observacion || 'Sin observaciones'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Editar
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setConfirmDelete(true)}
        >
          Eliminar
        </Button>
      </Box>
      
      {/* Formulario de edición */}
      {openForm && (
        <TransactionForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          transaction={transaction}
        />
      )}
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar esta transacción? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Función para determinar el color del chip según el tipo de transacción
function getTransactionTypeColor(tipoNombre: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const lowerCaseName = tipoNombre.toLowerCase();
  
  if (lowerCaseName.includes('retiro')) return 'error';
  if (lowerCaseName.includes('depósito')) return 'success';
  if (lowerCaseName.includes('comisión')) return 'warning';
  if (lowerCaseName.includes('adicional')) return 'info';
  
  return 'default';
}

export default TransactionDetail;

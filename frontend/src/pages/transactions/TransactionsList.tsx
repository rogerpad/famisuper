import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  Description as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transactionsApi, { Transaction } from '../../api/transactions/transactionsApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TransactionForm from './TransactionForm';

const TransactionsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Consulta para obtener todas las transacciones
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getAll,
  });

  // Mutación para eliminar una transacción
  const deleteMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setConfirmDelete(null);
    },
  });

  const handleOpenForm = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
    } else {
      setEditingTransaction(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteConfirm = (id: number) => {
    setConfirmDelete(id);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMutation.mutate(confirmDelete);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70 
    },
    { 
      field: 'fecha', 
      headerName: 'Fecha', 
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => formatDate(params.value),
    },
    { 
      field: 'hora', 
      headerName: 'Hora', 
      flex: 1,
      minWidth: 100 
    },
    { 
      field: 'usuario', 
      headerName: 'Usuario', 
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => params.row.usuario?.nombre || 'Administrador Sistema',
    },
    { 
      field: 'agente', 
      headerName: 'Agente', 
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => params.row.agente?.nombre || '',
    },
    { 
      field: 'tipoTransaccion', 
      headerName: 'Transacción', 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const tipoNombre = params.row.tipoTransaccion?.nombre || '';
        let color = 'default';
        
        if (tipoNombre.toLowerCase().includes('retiro')) color = 'error';
        if (tipoNombre.toLowerCase().includes('depósito')) color = 'success';
        if (tipoNombre.toLowerCase().includes('comisión')) color = 'warning';
        if (tipoNombre.toLowerCase().includes('adicional')) color = 'info';
        
        return (
          <Chip 
            label={tipoNombre} 
            color={color as 'default' | 'success' | 'warning' | 'error' | 'info'} 
            size="small" 
          />
        );
      }
    },
    { 
      field: 'valor', 
      headerName: 'Valor', 
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        return `L${params.value.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
      }
    },
    { 
      field: 'observacion', 
      headerName: 'Observación', 
      flex: 1.5,
      minWidth: 200,
      valueGetter: (params) => params.row.observacion || '-',
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => handleOpenForm(params.row as Transaction)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleDeleteConfirm(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filteredTransactions = transactions.filter(
    (transaction) =>
      (transaction.agente?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.tipoTransaccion?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="transactions-icon" style={{ fontSize: '1.2em' }}>💳</span>
          Transacciones
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<ReportIcon />}
            onClick={() => navigate('/reports')}
            sx={{ mr: 2 }}
          >
            Reporte de Transacciones
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            color="primary"
          >
            Nueva Transacción
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por agente o tipo de transacción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
              sorting: {
                sortModel: [{ field: 'id', sort: 'desc' }],
              },
            }}
            disableRowSelectionOnClick
            sx={{ minHeight: 400 }}
          />
        )}
      </Paper>

      {/* Formulario de transacción */}
      {openForm && (
        <TransactionForm
          open={openForm}
          onClose={handleCloseForm}
          transaction={editingTransaction}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar esta transacción? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsList;

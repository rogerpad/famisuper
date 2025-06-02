import React, { useState, useEffect } from 'react';
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
  DialogTitle,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  SelectChangeEvent
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
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import TransactionForm from './TransactionForm';

const TransactionsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filterOption, setFilterOption] = useState<string>('active');
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Consulta para obtener todas las transacciones
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', filterOption],
    queryFn: async () => {
      // Si el filtro es 'today', obtenemos las transacciones del día
      if (filterOption === 'today') {
        const today = new Date();
        const startDate = format(startOfDay(today), 'yyyy-MM-dd');
        const endDate = format(endOfDay(today), 'yyyy-MM-dd');
        return transactionsApi.getByDateRange(startDate, endDate);
      } 
      // Si el filtro es 'all', obtenemos todas las transacciones incluyendo inactivas
      else if (filterOption === 'all') {
        return transactionsApi.getAllWithInactive();
      }
      // Por defecto, obtenemos solo las transacciones activas
      return transactionsApi.getAll();
    },
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
      // Crear una copia de la transacción para evitar problemas de referencia
      setEditingTransaction({
        ...transaction,
        // Asegurar que el estado sea un número
        estado: typeof transaction.estado === 'number' ? transaction.estado : 1
      });
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
      flex: 2,
      minWidth: 200,
      valueGetter: (params) => params.row.observacion || '',
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const estado = params.row.estado;
        let label = '';
        let color: 'success' | 'error' | 'default' = 'default';
        
        if (estado === 1) {
          label = 'Activa';
          color = 'success';
        } else {
          label = 'Inactiva';
          color = 'error';
        }
        
        return (
          <Chip 
            label={label} 
            color={color} 
            size="small" 
            variant="outlined"
          />
        );
      },
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

  // Filtrar transacciones según la opción seleccionada y el término de búsqueda
  useEffect(() => {
    let filtered = [...transactions];
    
    // Si el filtro es 'all', mostramos todas las transacciones (incluyendo inactivas)
    if (filterOption === 'all') {
      // No aplicamos filtro por estado
    } else if (filterOption === 'active') {
      // Filtramos solo las activas (estado = 1)
      filtered = filtered.filter(transaction => transaction.estado === 1);
    }
    // Si el filtro es 'today', ya hemos obtenido solo las del día desde la API
    
    // Aplicar filtro de búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          (transaction.agente?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (transaction.tipoTransaccion?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  }, [transactions, searchTerm, filterOption]);
  
  // Manejar cambio de opción de filtro
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterOption(event.target.value as string);
  };

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
            onClick={() => navigate('/reports', { state: { tabIndex: 1 } })}
            sx={{ mr: 2 }}
          >
            Resumen de Transacciones
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
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}>
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
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-label">Mostrar</InputLabel>
              <Select
                labelId="filter-label"
                value={filterOption}
                onChange={handleFilterChange}
                label="Mostrar"
              >
                <MenuItem value="active">Solo las activas</MenuItem>
                <MenuItem value="today">Todas las transacciones del día</MenuItem>
                <MenuItem value="all">Todas las transacciones</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredData}
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

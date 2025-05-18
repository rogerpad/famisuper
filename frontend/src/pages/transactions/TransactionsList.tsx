import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

interface Transaction {
  id: string;
  date: string;
  reference: string;
  amount: number;
  status: string;
  customerName: string;
}

const TransactionsList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // En un escenario real, estos datos vendrían de la API
    // Aquí simulamos los datos para la demostración
    setTimeout(() => {
      const demoData: Transaction[] = [
        { 
          id: '1', 
          date: '2025-05-13', 
          reference: 'TRX-001', 
          amount: 1250.00, 
          status: 'Completada', 
          customerName: 'Juan Pérez' 
        },
        { 
          id: '2', 
          date: '2025-05-12', 
          reference: 'TRX-002', 
          amount: 890.50, 
          status: 'Completada', 
          customerName: 'María González' 
        },
        { 
          id: '3', 
          date: '2025-05-11', 
          reference: 'TRX-003', 
          amount: 2340.75, 
          status: 'Pendiente', 
          customerName: 'Carlos Rodríguez' 
        },
        { 
          id: '4', 
          date: '2025-05-10', 
          reference: 'TRX-004', 
          amount: 1100.25, 
          status: 'Completada', 
          customerName: 'Ana Martínez' 
        },
        { 
          id: '5', 
          date: '2025-05-09', 
          reference: 'TRX-005', 
          amount: 760.00, 
          status: 'Pendiente', 
          customerName: 'Roberto Sánchez' 
        },
        { 
          id: '6', 
          date: '2025-05-08', 
          reference: 'TRX-006', 
          amount: 1500.00, 
          status: 'Cancelada', 
          customerName: 'Laura Díaz' 
        },
        { 
          id: '7', 
          date: '2025-05-07', 
          reference: 'TRX-007', 
          amount: 950.30, 
          status: 'Completada', 
          customerName: 'Pedro Fernández' 
        },
        { 
          id: '8', 
          date: '2025-05-06', 
          reference: 'TRX-008', 
          amount: 2100.00, 
          status: 'Pendiente', 
          customerName: 'Sofía López' 
        },
      ];
      
      setTransactions(demoData);
      setLoading(false);
    }, 1000);
    
    // En una implementación real, usaríamos:
    // const fetchTransactions = async () => {
    //   try {
    //     const response = await api.get('/transactions');
    //     setTransactions(response.data);
    //   } catch (error) {
    //     console.error('Error fetching transactions:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchTransactions();
  }, []);

  const columns: GridColDef[] = [
    { 
      field: 'reference', 
      headerName: 'Referencia', 
      flex: 1,
      minWidth: 120 
    },
    { 
      field: 'date', 
      headerName: 'Fecha', 
      flex: 1,
      minWidth: 120 
    },
    { 
      field: 'customerName', 
      headerName: 'Cliente', 
      flex: 1.5,
      minWidth: 180 
    },
    { 
      field: 'amount', 
      headerName: 'Monto', 
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        return `$${params.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
      }
    },
    { 
      field: 'status', 
      headerName: 'Estado', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'Completada') color = 'success';
        if (params.value === 'Pendiente') color = 'warning';
        if (params.value === 'Cancelada') color = 'error';
        
        return (
          <Chip 
            label={params.value} 
            color={color as 'default' | 'success' | 'warning' | 'error'} 
            size="small" 
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/transactions/${params.row.id}`)}
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Transacciones
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/transactions/new')}
        >
          Nueva Transacción
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por referencia o cliente..."
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
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            autoHeight
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            disableRowSelectionOnClick
            sx={{ minHeight: 400 }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default TransactionsList;

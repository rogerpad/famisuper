import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from '@mui/icons-material';
import transactionsApi from '../../api/transactions/transactionsApi';

const TransactionSummary: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Formatear fechas para la API
  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  // Consulta para obtener las transacciones usando los endpoints específicos para el resumen
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions-summary', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      // Si ambas fechas están definidas, usar getByDateRangeForSummary
      if (formattedStartDate && formattedEndDate) {
        return transactionsApi.getByDateRangeForSummary(formattedStartDate, formattedEndDate);
      } 
      // Si no hay fechas, obtener todas las transacciones activas para el resumen
      return transactionsApi.getForSummary();
    },
  });

  // Filtrar transacciones por término de búsqueda
  const filteredTransactions = transactions.filter(
    (transaction) =>
      (transaction.agente?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.tipoTransaccion?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Calcular totales por tipo de transacción
  const transactionSummary = filteredTransactions.reduce((acc, transaction) => {
    const tipoNombre = transaction.tipoTransaccion?.nombre || 'Sin clasificar';
    if (!acc[tipoNombre]) {
      acc[tipoNombre] = {
        count: 0,
        total: 0,
      };
    }
    acc[tipoNombre].count += 1;
    acc[tipoNombre].total += transaction.valor;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Calcular totales por agente
  const agentSummary = filteredTransactions.reduce((acc, transaction) => {
    const agentNombre = transaction.agente?.nombre || 'Sin agente';
    if (!acc[agentNombre]) {
      acc[agentNombre] = {
        count: 0,
        total: 0,
      };
    }
    acc[agentNombre].count += 1;
    acc[agentNombre].total += transaction.valor;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return `L ${new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="summary-icon" style={{ fontSize: '1.2em' }}>📊</span>
          Resumen de Transacciones
        </Typography>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Inicio"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    size: 'small',
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Fin"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    size: 'small',
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
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
        </Grid>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Resumen general */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen General
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Total Transacciones:</Typography>
                    <Typography variant="h5">{filteredTransactions.length}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Monto Total:</Typography>
                    <Typography variant="h5">
                      {formatCurrency(
                        filteredTransactions.reduce((sum, transaction) => sum + transaction.valor, 0)
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1">Agentes Involucrados:</Typography>
                    <Typography variant="h5">
                      {Object.keys(agentSummary).length}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen por tipo de transacción */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Por Tipo de Transacción
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {Object.entries(transactionSummary).length > 0 ? (
                  Object.entries(transactionSummary).map(([tipo, { count, total }]) => (
                    <Box key={tipo} sx={{ mb: 2 }}>
                      <Grid container>
                        <Grid item xs={7}>
                          <Typography variant="subtitle1">{tipo}</Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">{count} trans.</Typography>
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle2">{formatCurrency(total)}</Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No hay datos disponibles
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen por agente */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Por Agente
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {Object.entries(agentSummary).length > 0 ? (
                  Object.entries(agentSummary).map(([agente, { count, total }]) => (
                    <Box key={agente} sx={{ mb: 2 }}>
                      <Grid container>
                        <Grid item xs={7}>
                          <Typography variant="subtitle1">{agente}</Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">{count} trans.</Typography>
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle2">{formatCurrency(total)}</Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No hay datos disponibles
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default TransactionSummary;

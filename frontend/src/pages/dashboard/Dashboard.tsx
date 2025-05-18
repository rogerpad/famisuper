import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import api from '../../api/api';

interface DashboardStats {
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  totalAmount: number;
}

interface RecentTransaction {
  id: string;
  date: string;
  amount: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En un escenario real, estos datos vendrían de la API
    // Aquí simulamos los datos para la demostración
    setTimeout(() => {
      setStats({
        totalTransactions: 156,
        pendingTransactions: 23,
        completedTransactions: 133,
        totalAmount: 45678.90
      });
      
      setRecentTransactions([
        { id: '1', date: '2025-05-13', amount: 1250.00, status: 'Completada' },
        { id: '2', date: '2025-05-12', amount: 890.50, status: 'Completada' },
        { id: '3', date: '2025-05-11', amount: 2340.75, status: 'Pendiente' },
        { id: '4', date: '2025-05-10', amount: 1100.25, status: 'Completada' },
        { id: '5', date: '2025-05-09', amount: 760.00, status: 'Pendiente' }
      ]);
      
      setLoading(false);
    }, 1000);
    
    // En una implementación real, usaríamos:
    // const fetchDashboardData = async () => {
    //   try {
    //     const statsResponse = await api.get('/dashboard/stats');
    //     const transactionsResponse = await api.get('/dashboard/recent-transactions');
    //     
    //     setStats(statsResponse.data);
    //     setRecentTransactions(transactionsResponse.data);
    //   } catch (error) {
    //     console.error('Error fetching dashboard data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6">
                Total Transacciones
              </Typography>
              <ReceiptIcon />
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {stats?.totalTransactions}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6">
                Pendientes
              </Typography>
              <TrendingUpIcon />
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {stats?.pendingTransactions}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6">
                Completadas
              </Typography>
              <PersonIcon />
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {stats?.completedTransactions}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography component="h2" variant="h6">
                Monto Total
              </Typography>
              <AttachMoneyIcon />
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              ${stats?.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Transacciones recientes */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Transacciones Recientes" />
            <Divider />
            <CardContent>
              <List>
                {recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemText
                        primary={`Transacción #${transaction.id}`}
                        secondary={`Fecha: ${transaction.date}`}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Estado: {transaction.status}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ${transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

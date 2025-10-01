import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider,
  CircularProgress,
  Paper,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  AttachMoney, 
  People, 
  ShoppingCart,
  AccessTime
} from '@mui/icons-material';
import { useTurno } from '../contexts/TurnoContext';

// Tipo para las estadísticas del turno
interface TurnoStats {
  ventasTotal: number;
  transacciones: number;
  ticketPromedio: number;
  clientesAtendidos: number;
  comparacionTurnoAnterior: number;
  productosVendidos: number;
  tiempoPromedioAtencion: number;
}

const TurnoStats: React.FC = () => {
  const { turnoActual, loading } = useTurno();
  const [stats, setStats] = useState<TurnoStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Función para cargar estadísticas del turno actual
  useEffect(() => {
    const fetchStats = async () => {
      if (!turnoActual) {
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);
      
      try {
        // En un entorno real, esto sería una llamada a la API
        // const response = await axios.get(`/api/turnos/${turnoActual.id}/stats`);
        // setStats(response.data);
        
        // Por ahora, simulamos datos de estadísticas
        // Generamos datos aleatorios pero realistas para simular estadísticas
        const ventasTotal = Math.floor(Math.random() * 50000) + 10000; // Entre 10,000 y 60,000
        const transacciones = Math.floor(Math.random() * 50) + 10; // Entre 10 y 60
        const ticketPromedio = Math.round(ventasTotal / transacciones);
        const clientesAtendidos = Math.floor(transacciones * 1.2); // Algunos clientes no compran
        const comparacionTurnoAnterior = Math.floor(Math.random() * 30) - 10; // Entre -10% y +20%
        const productosVendidos = Math.floor(transacciones * (Math.random() * 5 + 2)); // Entre 2 y 7 productos por transacción
        const tiempoPromedioAtencion = Math.floor(Math.random() * 5) + 3; // Entre 3 y 8 minutos
        
        // Simulamos un retraso de red
        setTimeout(() => {
          setStats({
            ventasTotal,
            transacciones,
            ticketPromedio,
            clientesAtendidos,
            comparacionTurnoAnterior,
            productosVendidos,
            tiempoPromedioAtencion
          });
          setLoadingStats(false);
        }, 800);
        
      } catch (error) {
        console.error('Error al cargar estadísticas del turno:', error);
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [turnoActual]);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading || loadingStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!turnoActual) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay turno activo en este momento
        </Typography>
      </Paper>
    );
  }

  if (!stats) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay estadísticas disponibles para este turno
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          Estadísticas del {turnoActual.nombre}
        </Typography>
        <Chip 
          label={`${turnoActual.horaInicio} - ${turnoActual.horaFin}`} 
          size="small" 
          sx={{ ml: 2 }} 
          color="primary"
        />
      </Box>

      <Grid container spacing={2}>
        {/* Ventas totales */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Ventas Totales
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(stats.ventasTotal)}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {stats.comparacionTurnoAnterior > 0 ? (
                  <>
                    <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{stats.comparacionTurnoAnterior}% vs. turno anterior
                    </Typography>
                  </>
                ) : (
                  <>
                    <TrendingDown fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                    <Typography variant="body2" color="error.main">
                      {stats.comparacionTurnoAnterior}% vs. turno anterior
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transacciones */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Transacciones
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.transacciones}
                  </Typography>
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.7 }} />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Ticket promedio: {formatCurrency(stats.ticketPromedio)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Clientes atendidos */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Clientes Atendidos
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.clientesAtendidos}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tiempo promedio: {stats.tiempoPromedioAtencion} min/cliente
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Productos vendidos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="div">
                  Resumen del Turno
                </Typography>
                <Chip 
                  label={`${stats.productosVendidos} productos vendidos`} 
                  color="secondary" 
                  size="small" 
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de conversión:
                  </Typography>
                  <Typography variant="body1">
                    {Math.round((stats.transacciones / stats.clientesAtendidos) * 100)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Productos por transacción:
                  </Typography>
                  <Typography variant="body1">
                    {(stats.productosVendidos / stats.transacciones).toFixed(1)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TurnoStats;

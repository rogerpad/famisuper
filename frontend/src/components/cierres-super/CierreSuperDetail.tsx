import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCierresSuper } from '../../api/cierres-super/cierresSuperApi';
import { CierreSuper } from '../../api/cierres-super/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const CierreSuperDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, fetchCierreSuperById } = useCierresSuper();
  const [cierreSuper, setCierreSuper] = useState<CierreSuper | null>(null);
  const { state: authState } = useAuth();

  useEffect(() => {
    const fetchCierre = async () => {
      if (id) {
        const cierre = await fetchCierreSuperById(parseInt(id));
        if (cierre) {
          setCierreSuper(cierre);
        }
      }
    };
    fetchCierre();
  }, [id, fetchCierreSuperById]);

  const handleBack = () => {
    navigate('/cierres-super');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/cierres-super/${id}/edit`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!cierreSuper) {
    return <Typography>No se encontró el cierre solicitado</Typography>;
  }

  const canEdit = !!authState.permissions?.['crear_editar_cierre_super'];

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h5">
            Detalle de Cierre #{cierreSuper.id}
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Editar
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Usuario
              </Typography>
              <Typography variant="body1" gutterBottom>
                {cierreSuper.usuario
                  ? `${cierreSuper.usuario.nombre} ${cierreSuper.usuario.apellido || ''} (${cierreSuper.usuario.username})`
                  : `ID: ${cierreSuper.usuarioId}`}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha de Cierre
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(cierreSuper.fechaCierre)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Chip
                  label={cierreSuper.activo ? 'Activo' : 'Inactivo'}
                  color={cierreSuper.activo ? 'success' : 'default'}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Resumen Financiero
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Efectivo Inicial
              </Typography>
              <Typography variant="h6">{formatCurrency(cierreSuper.efectivoInicial)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Efectivo Total
              </Typography>
              <Typography variant="h6">{formatCurrency(cierreSuper.efectivoTotal)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Efectivo Cierre Turno
              </Typography>
              <Typography variant="h6">{formatCurrency(cierreSuper.efectivoCierreTurno)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Faltante/Sobrante
              </Typography>
              <Typography 
                variant="h6" 
                color={cierreSuper.faltanteSobrante < 0 ? 'error.main' : 'success.main'}
              >
                {formatCurrency(cierreSuper.faltanteSobrante)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Detalles de Ingresos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Adicional Casa
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.adicionalCasa)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Adicional Agente
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.adicionalAgente)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Venta Contado
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.ventaContado)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Venta Crédito
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.ventaCredito)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Venta POS
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.ventaPos)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Abono Crédito
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.abonoCredito)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Venta Saldo
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.ventaSaldo)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total SPV
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.totalSpv)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Transferencias
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Transferencia Occidente
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.transfOccidente)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Transferencia Atlántida
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.transfAtlantida)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Transferencia BAC
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.transfBac)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Transferencia Banpaís
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.transfBanpais)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Egresos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Pago Productos
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.pagoProductos)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Gastos
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.gastos)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Préstamos a Agentes
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.prestaAgentes)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Efectivo en Caja Fuerte
              </Typography>
              <Typography variant="body1">{formatCurrency(cierreSuper.efectivoCajaF)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Volver a la lista
        </Button>
      </Box>
    </Paper>
  );
};

export default CierreSuperDetail;

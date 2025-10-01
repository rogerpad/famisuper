import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getAdicionalesPrestamosById,
  AdicionalesPrestamosData
} from '../../api/adicionales-prestamos/adicionalesPrestamosApi';
import { usePermissions } from '../../hooks/usePermissions';

const AdicionalesPrestamosDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const [adicional, setAdicional] = useState<AdicionalesPrestamosData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Permisos
  const canView = hasPermission('ver_adic_presta');
  const canEdit = hasPermission('crear_editar_adic_prest');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getAdicionalesPrestamosById(parseInt(id, 10));
        setAdicional(data);
        setError(null);
      } catch (err) {
        console.error('[ADICIONALES_PRESTAMOS_DETALLE] Error al cargar datos:', err);
        setError('Error al cargar los detalles del adicional/préstamo');
      } finally {
        setLoading(false);
      }
    };

    if (canView) {
      fetchData();
    }
  }, [id, canView]);

  // Formatear fecha
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      console.error('[ADICIONALES_PRESTAMOS_DETALLE] Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Volver a la lista
  const handleBack = () => {
    navigate('/adicionales-prestamos');
  };

  // Ir a editar
  const handleEdit = () => {
    if (id) {
      navigate(`/adicionales-prestamos/editar/${id}`);
    }
  };

  if (!canView) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" color="error">
          No tiene permisos para ver adicionales/préstamos
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Detalle de Adicional/Préstamo</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Volver
          </Button>
          {canEdit && adicional && (
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
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : adicional ? (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    Estado:
                  </Typography>
                  <Chip
                    label={adicional.activo ? 'Activo' : 'Inactivo'}
                    color={adicional.activo ? 'success' : 'default'}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Usuario:
                </Typography>
                <Typography variant="body1">
                  {adicional.usuario 
                    ? `${adicional.usuario.nombre} ${adicional.usuario.apellido} (${adicional.usuario.username})`
                    : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Fecha:
                </Typography>
                <Typography variant="body1">
                  {formatDate(adicional.fecha)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Acuerdo:
                </Typography>
                <Typography variant="body1">
                  {adicional.acuerdo}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Origen:
                </Typography>
                <Typography variant="body1">
                  {adicional.origen}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Monto:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  L. {adicional.monto.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Descripción:
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {adicional.descripcion || 'Sin descripción'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="warning">
          No se encontró el adicional/préstamo solicitado
        </Alert>
      )}
    </Paper>
  );
};

export default AdicionalesPrestamosDetalle;

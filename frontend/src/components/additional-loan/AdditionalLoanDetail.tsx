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
  getAdditionalLoanById,
  AdditionalLoanData
} from '../../api/additional-loan/additionalLoanApi';
import { usePermissions } from '../../hooks/usePermissions';

const AdditionalLoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const [loan, setLoan] = useState<AdditionalLoanData | null>(null);
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
        const data = await getAdditionalLoanById(parseInt(id, 10));
        setLoan(data);
        setError(null);
      } catch (err) {
        console.error('[ADDITIONAL_LOAN_DETAIL] Error loading data:', err);
        setError('Error loading additional loan details');
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
      console.error('[ADDITIONAL_LOAN_DETAIL] Error formatting date:', error);
      return 'Invalid date';
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
          {canEdit && loan && (
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
      ) : loan ? (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    Estado:
                  </Typography>
                  <Chip
                    label={loan.activo ? 'Activo' : 'Inactivo'}
                    color={loan.activo ? 'success' : 'default'}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Usuario:
                </Typography>
                <Typography variant="body1">
                  {loan.usuario 
                    ? `${loan.usuario.nombre} ${loan.usuario.apellido} (${loan.usuario.username})`
                    : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Fecha:
                </Typography>
                <Typography variant="body1">
                  {formatDate(loan.fecha)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Acuerdo:
                </Typography>
                <Typography variant="body1">
                  {loan.acuerdo}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Origen:
                </Typography>
                <Typography variant="body1">
                  {loan.origen}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Monto:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  L. {loan.monto.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Descripción:
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {loan.descripcion || 'Sin descripción'}
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

export default AdditionalLoanDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useConteoBilletesSuper } from '../../api/conteo-billetes-super/conteoBilletesSuperApi';
import { ConteoBilletesSuper } from '../../api/conteo-billetes-super/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../contexts/AuthContext';

// Funciones utilitarias para conversión segura de tipos
const safeParseInt = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const safeParseFloat = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
};

const ensureNumber = (value: any, defaultValue = 0): number => {
  if (typeof value === 'number') return value;
  return safeParseFloat(value, defaultValue);
};

interface DenominacionRow {
  denominacion: number;
  cantidad: number;
  total: number;
}

const ConteoBilletesSuperDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { fetchConteoBilletesSuperById, loading, error } = useConteoBilletesSuper();
  const [conteo, setConteo] = useState<ConteoBilletesSuper | null>(null);

  // Verificar permisos
  const canEdit = !!state.permissions['crear_editar_conteo_super'];

  // Cargar datos del conteo
  useEffect(() => {
    if (id) {
      const loadConteo = async () => {
        try {
          const data = await fetchConteoBilletesSuperById(parseInt(id));
          setConteo(data);
        } catch (error) {
          console.error('Error al cargar conteo:', error);
        }
      };

      loadConteo();
    }
  }, [id, fetchConteoBilletesSuperById]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Crear filas de denominaciones con conversión segura de tipos
  const getDenominaciones = (): DenominacionRow[] => {
    if (!conteo) return [];

    return [
      { denominacion: 500, cantidad: safeParseInt(conteo.cant500, 0), total: ensureNumber(conteo.total500, 0) },
      { denominacion: 200, cantidad: safeParseInt(conteo.cant200, 0), total: ensureNumber(conteo.total200, 0) },
      { denominacion: 100, cantidad: safeParseInt(conteo.cant100, 0), total: ensureNumber(conteo.total100, 0) },
      { denominacion: 50, cantidad: safeParseInt(conteo.cant50, 0), total: ensureNumber(conteo.total50, 0) },
      { denominacion: 20, cantidad: safeParseInt(conteo.cant20, 0), total: ensureNumber(conteo.total20, 0) },
      { denominacion: 10, cantidad: safeParseInt(conteo.cant10, 0), total: ensureNumber(conteo.total10, 0) },
      { denominacion: 5, cantidad: safeParseInt(conteo.cant5, 0), total: ensureNumber(conteo.total5, 0) },
      { denominacion: 2, cantidad: safeParseInt(conteo.cant2, 0), total: ensureNumber(conteo.total2, 0) },
      { denominacion: 1, cantidad: safeParseInt(conteo.cant1, 0), total: ensureNumber(conteo.total1, 0) },
    ];
  };

  // Manejar navegación
  const handleBack = () => {
    navigate('/conteo-billetes-super');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/conteo-billetes-super/edit/${id}`);
    }
  };

  if (loading) {
    return <Typography>Cargando datos...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!conteo) {
    return <Typography>No se encontró el conteo solicitado</Typography>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Detalle de Conteo de Efectivo</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Volver
          </Button>
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
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1">
            <strong>ID:</strong> {conteo.id}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body1">
            <strong>Usuario:</strong> {conteo.usuario
              ? `${conteo.usuario.nombre} ${conteo.usuario.apellido || ''}`
              : `ID: ${conteo.usuarioId}`}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body1">
            <strong>Fecha:</strong> {formatDate(conteo.fecha)}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" mb={2}>
        Detalle de Billetes y Monedas
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Denominación</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getDenominaciones().map((row) => (
              <TableRow key={row.denominacion}>
                <TableCell>L {row.denominacion}</TableCell>
                <TableCell align="right">{row.cantidad}</TableCell>
                <TableCell align="right">L {ensureNumber(row.total, 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell colSpan={2}>
                <Typography variant="subtitle1" fontWeight="bold">Total General</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold">
                  L {ensureNumber(conteo.totalGeneral, 0).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ConteoBilletesSuperDetail;

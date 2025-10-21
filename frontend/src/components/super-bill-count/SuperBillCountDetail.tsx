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
import { useSuperBillCount } from '../../api/super-bill-count/superBillCountApi';
import { SuperBillCount } from '../../api/super-bill-count/types';
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

const SuperBillCountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { fetchSuperBillCountById, loading, error } = useSuperBillCount();
  const [count, setConteo] = useState<SuperBillCount | null>(null);

  // Verificar permisos
  const canEdit = !!state.permissions['crear_editar_conteo_super'];

  // Cargar datos del count
  useEffect(() => {
    if (id) {
      const loadConteo = async () => {
        try {
          const data = await fetchSuperBillCountById(parseInt(id));
          setConteo(data);
        } catch (error) {
          console.error('Error al cargar count:', error);
        }
      };

      loadConteo();
    }
  }, [id, fetchSuperBillCountById]);

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
    if (!count) return [];

    return [
      { denominacion: 500, cantidad: safeParseInt(count.cant500, 0), total: ensureNumber(count.total500, 0) },
      { denominacion: 200, cantidad: safeParseInt(count.cant200, 0), total: ensureNumber(count.total200, 0) },
      { denominacion: 100, cantidad: safeParseInt(count.cant100, 0), total: ensureNumber(count.total100, 0) },
      { denominacion: 50, cantidad: safeParseInt(count.cant50, 0), total: ensureNumber(count.total50, 0) },
      { denominacion: 20, cantidad: safeParseInt(count.cant20, 0), total: ensureNumber(count.total20, 0) },
      { denominacion: 10, cantidad: safeParseInt(count.cant10, 0), total: ensureNumber(count.total10, 0) },
      { denominacion: 5, cantidad: safeParseInt(count.cant5, 0), total: ensureNumber(count.total5, 0) },
      { denominacion: 2, cantidad: safeParseInt(count.cant2, 0), total: ensureNumber(count.total2, 0) },
      { denominacion: 1, cantidad: safeParseInt(count.cant1, 0), total: ensureNumber(count.total1, 0) },
    ];
  };

  // Manejar navegación
  const handleBack = () => {
    navigate('/count-billetes-super');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/count-billetes-super/edit/${id}`);
    }
  };

  if (loading) {
    return <Typography>Cargando datos...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  if (!count) {
    return <Typography>No se encontró el count solicitado</Typography>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Efectivo Super #{count.id}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Fecha:</strong> {formatDate(count.fecha)}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Usuario:</strong> {count.usuario
            ? `${count.usuario.nombre} ${count.usuario.apellido || ''}`
            : `ID: ${count.usuarioId}`}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Total:</strong> L {ensureNumber(count.totalGeneral, 0).toFixed(2)}
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Denominación</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getDenominaciones().map((row) => (
              <TableRow key={row.denominacion}>
                <TableCell>{row.denominacion}</TableCell>
                <TableCell align="center">{row.cantidad}</TableCell>
                <TableCell align="right">L {ensureNumber(row.total, 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} align="right">
                <Typography variant="subtitle2" fontWeight="bold">Total General</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight="bold">
                  L{ensureNumber(count.totalGeneral, 0).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.print()}
        >
          Imprimir
        </Button>
      </Box>
    </Paper>
  );
};

export default SuperBillCountDetail;


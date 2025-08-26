import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  InputAdornment,
} from '@mui/material';
// Importaciones de date-fns para formateo de fechas
import { useConteoBilletesSuper } from '../../api/conteo-billetes-super/conteoBilletesSuperApi';
import { ConteoBilletesSuperFormData } from '../../api/conteo-billetes-super/types';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
  field: keyof ConteoBilletesSuperFormData;
}

const ConteoBilletesSuperForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { state } = useAuth();
  const {
    fetchConteoBilletesSuperById,
    createConteoBilletesSuper,
    updateConteoBilletesSuper,
    loading,
    error,
  } = useConteoBilletesSuper();

  // Estado para el formulario
  const [formData, setFormData] = useState<ConteoBilletesSuperFormData>({
    cant500: 0,
    cant200: 0,
    cant100: 0,
    cant50: 0,
    cant20: 0,
    cant10: 0,
    cant5: 0,
    cant2: 0,
    cant1: 0,
    // La fecha se generará automáticamente en el backend
  });

  // Estado para los totales calculados
  const [totals, setTotals] = useState({
    total500: 0,
    total200: 0,
    total100: 0,
    total50: 0,
    total20: 0,
    total10: 0,
    total5: 0,
    total2: 0,
    total1: 0,
    totalGeneral: 0,
  });

  // Estado para el envío del formulario
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [conteoId, setConteoId] = useState<number | null>(null);

  // Definir las filas de denominaciones
  const denominaciones: DenominacionRow[] = [
    { denominacion: 500, cantidad: formData.cant500, total: totals.total500, field: 'cant500' },
    { denominacion: 200, cantidad: formData.cant200, total: totals.total200, field: 'cant200' },
    { denominacion: 100, cantidad: formData.cant100, total: totals.total100, field: 'cant100' },
    { denominacion: 50, cantidad: formData.cant50, total: totals.total50, field: 'cant50' },
    { denominacion: 20, cantidad: formData.cant20, total: totals.total20, field: 'cant20' },
    { denominacion: 10, cantidad: formData.cant10, total: totals.total10, field: 'cant10' },
    { denominacion: 5, cantidad: formData.cant5, total: totals.total5, field: 'cant5' },
    { denominacion: 2, cantidad: formData.cant2, total: totals.total2, field: 'cant2' },
    { denominacion: 1, cantidad: formData.cant1, total: totals.total1, field: 'cant1' },
  ];

  // Función para calcular los totales con conversión segura de tipos
  const calculateTotals = useCallback((data: ConteoBilletesSuperFormData) => {
    // Asegurar que todos los valores sean números
    const cant500 = safeParseInt(data.cant500, 0);
    const cant200 = safeParseInt(data.cant200, 0);
    const cant100 = safeParseInt(data.cant100, 0);
    const cant50 = safeParseInt(data.cant50, 0);
    const cant20 = safeParseInt(data.cant20, 0);
    const cant10 = safeParseInt(data.cant10, 0);
    const cant5 = safeParseInt(data.cant5, 0);
    const cant2 = safeParseInt(data.cant2, 0);
    const cant1 = safeParseInt(data.cant1, 0);
    
    // Calcular totales
    const total500 = cant500 * 500;
    const total200 = cant200 * 200;
    const total100 = cant100 * 100;
    const total50 = cant50 * 50;
    const total20 = cant20 * 20;
    const total10 = cant10 * 10;
    const total5 = cant5 * 5;
    const total2 = cant2 * 2;
    const total1 = cant1 * 1;
    const totalGeneral = total500 + total200 + total100 + total50 + total20 + total10 + total5 + total2 + total1;

    return {
      total500,
      total200,
      total100,
      total50,
      total20,
      total10,
      total5,
      total2,
      total1,
      totalGeneral,
    };
  }, []);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (isEditMode && id) {
      const loadConteo = async () => {
        try {
          const conteo = await fetchConteoBilletesSuperById(parseInt(id));
          if (conteo) {
            setConteoId(conteo.id);
            // Aplicar conversión segura de tipos para cada campo
            setFormData({
              cant500: safeParseInt(conteo.cant500, 0),
              cant200: safeParseInt(conteo.cant200, 0),
              cant100: safeParseInt(conteo.cant100, 0),
              cant50: safeParseInt(conteo.cant50, 0),
              cant20: safeParseInt(conteo.cant20, 0),
              cant10: safeParseInt(conteo.cant10, 0),
              cant5: safeParseInt(conteo.cant5, 0),
              cant2: safeParseInt(conteo.cant2, 0),
              cant1: safeParseInt(conteo.cant1, 0),
              // La fecha se genera automáticamente en el backend
            });
            
            // Actualizar los totales con conversión segura de tipos
            setTotals({
              total500: ensureNumber(conteo.total500, 0),
              total200: ensureNumber(conteo.total200, 0),
              total100: ensureNumber(conteo.total100, 0),
              total50: ensureNumber(conteo.total50, 0),
              total20: ensureNumber(conteo.total20, 0),
              total10: ensureNumber(conteo.total10, 0),
              total5: ensureNumber(conteo.total5, 0),
              total2: ensureNumber(conteo.total2, 0),
              total1: ensureNumber(conteo.total1, 0),
              totalGeneral: ensureNumber(conteo.totalGeneral, 0),
            });
          }
        } catch (error) {
          console.error('Error al cargar conteo:', error);
        }
      };

      loadConteo();
    }
  }, [id, isEditMode, fetchConteoBilletesSuperById]);

  // Actualizar totales cuando cambian las cantidades
  useEffect(() => {
    const newTotals = calculateTotals(formData);
    setTotals(newTotals);
  }, [formData, calculateTotals]);

  // Manejar cambios en los inputs con conversión segura de tipos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = safeParseInt(value, 0);
    
    console.log(`Campo ${name} cambiado a: ${value}, convertido a: ${numericValue}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: numericValue,
    }));
  };
  
  // La fecha ahora se genera automáticamente en el backend

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Asegurarse de que el usuario esté autenticado
      if (!state.user) {
        throw new Error('Usuario no autenticado');
      }

      // Preparar datos para enviar
      const dataToSubmit: ConteoBilletesSuperFormData = {
        ...formData,
        usuarioId: state.user.id,
        // La fecha se genera automáticamente en el backend
      };

      let result;
      if (isEditMode && conteoId) {
        // Actualizar conteo existente
        result = await updateConteoBilletesSuper(conteoId, dataToSubmit);
      } else {
        // Crear nuevo conteo
        result = await createConteoBilletesSuper(dataToSubmit);
      }

      if (result) {
        // Navegar a la lista de conteos
        navigate('/conteo-billetes-super');
      }
    } catch (error: any) {
      console.error('Error al guardar conteo:', error);
      alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} el conteo: ${error.message || 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/conteo-billetes-super');
  };

  // Formatear fecha actual
  const currentDate = format(new Date(), 'PPP', { locale: es });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Contador de Efectivo
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1">
            <strong>Usuario:</strong> {state.user ? `${state.user.nombre} ${state.user.apellido || ''}` : 'Usuario actual'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body1">
            <strong>Turno:</strong> Sin turno asignado
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body1">
            <strong>Fecha:</strong> {currentDate}
          </Typography>
        </Grid>
      </Grid>

      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="body1" mb={2}>
          Ingrese la cantidad de billetes y monedas para calcular el total de efectivo.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Grid container sx={{ bgcolor: '#f5f5f5', p: 1 }}>
            <Grid item xs={4}>
              <Typography variant="subtitle1" fontWeight="bold">Denominación</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1" fontWeight="bold">Cantidad</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
            </Grid>
          </Grid>

          {denominaciones.map((row) => (
            <Grid container key={row.denominacion} sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>
              <Grid item xs={4}>
                <Typography>{row.denominacion}</Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name={row.field}
                  type="number"
                  value={row.cantidad}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ min: 0, style: { textAlign: 'right' } }}
                  disabled={submitting}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  value={`L ${row.total.toFixed(2)}`}
                  size="small"
                  InputProps={{
                    readOnly: true,
                    style: { textAlign: 'right' }
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          ))}

          <Grid container sx={{ bgcolor: '#f5f5f5', p: 1, mt: 2 }}>
            <Grid item xs={8}>
              <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={`L ${totals.totalGeneral.toFixed(2)}`}
                size="small"
                InputProps={{
                  readOnly: true,
                  style: { fontWeight: 'bold', textAlign: 'right' }
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ConteoBilletesSuperForm;

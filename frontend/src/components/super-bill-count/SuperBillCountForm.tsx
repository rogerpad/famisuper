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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material';
// Importaciones de date-fns para formateo de fechas
import { useSuperBillCount } from '../../api/super-bill-count/superBillCountApi';
import { SuperBillCountFormData } from '../../api/super-bill-count/types';
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
  field: keyof SuperBillCountFormData;
}

const SuperBillCountForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { state } = useAuth();
  const {
    fetchSuperBillCountById,
    createSuperBillCount,
    updateSuperBillCount,
    loading,
    error,
  } = useSuperBillCount();

  // Estado para el formulario
  const [formData, setFormData] = useState<SuperBillCountFormData>({
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
  const [countId, setcountId] = useState<number | null>(null);
  
  // Estado para notificaciones
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

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
  const calculateTotals = useCallback((data: SuperBillCountFormData) => {
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
          const conteo = await fetchSuperBillCountById(parseInt(id));
          if (conteo) {
            setcountId(conteo.id);
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
  }, [id, isEditMode, fetchSuperBillCountById]);

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
  
  // Función para limpiar el formulario
  const clearForm = () => {
    setFormData({
      cant500: 0,
      cant200: 0,
      cant100: 0,
      cant50: 0,
      cant20: 0,
      cant10: 0,
      cant5: 0,
      cant2: 0,
      cant1: 0,
    });
    setcountId(null);
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
      const dataToSubmit: SuperBillCountFormData = {
        ...formData,
        usuarioId: state.user.id,
        // La fecha se genera automáticamente en el backend
      };

      let result;
      if (isEditMode && countId) {
        // Actualizar conteo existente
        result = await updateSuperBillCount(countId, dataToSubmit);
      } else {
        // Crear nuevo conteo
        result = await createSuperBillCount(dataToSubmit);
      }

      if (result) {
        // Mostrar notificación de éxito
        const message = isEditMode ? 'Conteo actualizado exitosamente' : 'Conteo guardado exitosamente';
        setSuccessMessage(message);
        setShowSuccess(true);
        
        // Si no estamos en modo edición, limpiar el formulario
        if (!isEditMode) {
          clearForm();
        } else {
          // Si estamos editando, navegar a la lista después de un breve delay
          setTimeout(() => {
            navigate('/conteo-billetes-super');
          }, 2000);
        }
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

  // Manejar cierre de notificación
  const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSuccess(false);
  };

  // Formatear fecha actual
  const currentDate = format(new Date(), 'PPP', { locale: es });

  return (
    <Box>
      {isEditMode && (
        <Typography variant="h6" gutterBottom>
          Editar Conteo de Efectivo
        </Typography>
      )}

      <Box sx={{ mb: 2 }}>
        {isEditMode && countId && (
          <>
            <Typography variant="body1" gutterBottom>
              <strong>Fecha:</strong> {currentDate}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>ID:</strong> {countId}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Usuario:</strong> {state.user ? `${state.user.nombre} ${state.user.apellido || ''}` : 'Usuario actual'}
            </Typography>
          </>
        )}
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          {/* El encabezado ahora está en la tabla */}

          <TableContainer component={Paper} sx={{ mb: 2, maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell padding="checkbox" sx={{ pl: 2 }}>Denominación</TableCell>
                  <TableCell padding="checkbox">Cantidad</TableCell>
                  <TableCell padding="checkbox">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {denominaciones.map((row, index) => (
                  <TableRow 
                    key={row.denominacion}
                    sx={{ 
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      height: '40px'
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>L {row.denominacion}</TableCell>
                    <TableCell padding="checkbox" sx={{ width: '100px' }}>
                      <TextField
                        name={row.field}
                        value={row.cantidad === 0 ? '' : row.cantidad}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        type="number"
                        inputProps={{ 
                          min: 0,
                          style: { padding: '5px 8px', height: '15px' } 
                        }}
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell padding="checkbox">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography component="span" variant="body2" sx={{ mr: 0.5 }}>L</Typography>
                        <Typography component="span" variant="body2">{row.total.toFixed(2)}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Total */}
                <TableRow sx={{ backgroundColor: '#e0e0e0', height: '36px' }}>
                  <TableCell padding="checkbox" sx={{ pl: 2 }}>
                    <Typography variant="body1" fontWeight="bold">Total</Typography>
                  </TableCell>
                  <TableCell padding="checkbox" />
                  <TableCell padding="checkbox">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography component="span" variant="body1" sx={{ mr: 0.5 }}>L</Typography>
                      <Typography component="span" variant="body1" fontWeight="bold">{totals.totalGeneral.toFixed(2)}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
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
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Actualizando...' : isEditMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Box>

      {/* Notificación de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperBillCountForm;


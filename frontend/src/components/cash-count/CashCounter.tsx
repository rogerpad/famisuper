import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import cashApi, { Billete, CashCountData as ApiCashCountData } from '../../api/cash/cashApi';
import { useTurno } from '../../contexts/TurnoContext';
import { useAuth } from '../../contexts/AuthContext';
import { toValidId, isValidId } from '../../utils/validationUtils';

interface Denomination {
  value: number;
  label: string;
  quantity: number;
  total: number;
}

interface CashCounterProps {
  onSave?: (data: { denominations: Denomination[], total: number }) => void;
  initialData?: { denominations: Denomination[], totalCash?: number, id?: number, turnoId?: number };
  readOnly?: boolean;
  isEditMode?: boolean;
}

const CashCounter: React.FC<CashCounterProps> = ({ onSave, initialData, readOnly = false, isEditMode = false }) => {
  // Usar contexto de autenticación para obtener el usuario actual
  const auth = useAuth();
  const currentUser = auth.state?.user;
  const userId = currentUser?.id;

  // Usar contexto de turno para obtener el turno actual
  const { turnoActual } = useTurno();
  // Validar el ID del turno usando la utilidad centralizada
  const turnoId = isValidId(turnoActual?.id) ? toValidId(turnoActual?.id) : null;

  // Definir solo las denominaciones de billetes
  const defaultDenominations: Denomination[] = [
    { value: 500, label: '500', quantity: 0, total: 0 },
    { value: 200, label: '200', quantity: 0, total: 0 },
    { value: 100, label: '100', quantity: 0, total: 0 },
    { value: 50, label: '50', quantity: 0, total: 0 },
    { value: 20, label: '20', quantity: 0, total: 0 },
    { value: 10, label: '10', quantity: 0, total: 0 },
    { value: 5, label: '5', quantity: 0, total: 0 },
    { value: 2, label: '2', quantity: 0, total: 0 },
    { value: 1, label: '1', quantity: 0, total: 0 }
  ];

  // Procesar datos iniciales para asegurar que todos los valores sean números
  const processInitialData = () => {
    if (initialData?.denominations) {
      return initialData.denominations
        .filter(d => d.value >= 1)
        .map(d => ({
          ...d,
          value: Number(d.value),
          quantity: Number(d.quantity),
          // Recalcular el total para asegurar que sea correcto
          total: Number(d.quantity) * Number(d.value)
        }));
    }
    return defaultDenominations;
  };

  // Usar datos iniciales procesados
  const [denominations, setDenominations] = useState<Denomination[]>(processInitialData());
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Calcular el total cuando cambian las denominaciones
  const calculateTotal = (denoms: Denomination[]): number => {
    return denoms.reduce((sum, item) => sum + Number(item.total), 0);
  };

  // Inicializar el totalCash con el valor calculado de las denominaciones procesadas
  const [totalCash, setTotalCash] = useState<number>(calculateTotal(processInitialData()));

  // Actualizar el total cuando cambian las cantidades
  useEffect(() => {
    const newTotal = calculateTotal(denominations);
    setTotalCash(newTotal);
  }, [denominations]);
  
  // Función para resetear el formulario a valores iniciales
  const handleReset = () => {
    setDenominations(defaultDenominations);
    setTotalCash(0);
    setSnackbarMessage('Formulario reiniciado');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };
  
  // Función para guardar el conteo en la base de datos
  const handleSaveToDatabase = async () => {
    if (!currentUser) {
      setSnackbarMessage('No hay un usuario autenticado para guardar el conteo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Validar que el ID de usuario sea válido usando la utilidad centralizada
    if (!isValidId(currentUser.id)) {
      console.error(`[CASH_COUNTER] ID de usuario inválido: ${currentUser.id}`);
      setSnackbarMessage(`ID de usuario inválido: ${currentUser.id}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Validar que haya denominaciones para guardar
      if (!denominations || denominations.length === 0) {
        throw new Error('No hay denominaciones para guardar');
      }
      
      // Validar que el total sea un número válido
      if (isNaN(totalCash) || totalCash < 0) {
        throw new Error('El total de efectivo no es válido');
      }
      
      // Crear objeto con la estructura esperada por la tabla tbl_conteo_billetes
      // Validar que el ID de usuario sea válido
      if (!isValidId(currentUser.id)) {
        throw new Error(`ID de usuario inválido: ${currentUser.id}`);
      }
      
      // Convertir explícitamente a number para evitar problemas de tipo
      const userId = Number(currentUser.id);
      
      // Asegurarnos de que totalCash sea un número válido
      if (totalCash === undefined || totalCash === null) {
        console.error('[CASH_COUNTER] totalCash es undefined o null');
        throw new Error('El total de efectivo es requerido');
      }
      
      const validTotalCash = isNaN(Number(totalCash)) ? 0 : Number(totalCash);
      
      // Validación adicional para asegurar que el total sea positivo
      if (validTotalCash < 0) {
        console.error(`[CASH_COUNTER] Total negativo no permitido: ${validTotalCash}`);
        throw new Error('El total de efectivo no puede ser negativo');
      }
      
      console.log(`[CASH_COUNTER] Total calculado y validado: ${validTotalCash}`);
      
      const cashCountData: ApiCashCountData = {
        usuarioId: userId,
        totalGeneral: validTotalCash,
        estado: true
      };
      
      // Manejar el turnoId según el modo (edición o nuevo)
      if (isEditMode && initialData && initialData.turnoId !== undefined && initialData.turnoId !== null) {
        // En modo edición, validar y preservar el turnoId original del conteo SOLO si es válido
        if (isValidId(initialData.turnoId)) {
          // Convertir explícitamente a número para evitar problemas de tipo
          const validTurnoId = toValidId(Number(initialData.turnoId));
          cashCountData.turnoId = validTurnoId;
          console.log(`[CASH_COUNTER] Modo edición: preservando turno original ID: ${cashCountData.turnoId}`);
        } else {
          console.warn(`[CASH_COUNTER] Modo edición: turnoId inválido: ${initialData.turnoId}, no se incluirá`);
          // Eliminar explícitamente el campo turnoId para evitar el error "property turnoId should not exist"
          delete cashCountData.turnoId;
        }
      } else if (!isEditMode && turnoId !== undefined && turnoId !== null) {
        // En modo nuevo, validar y asociar al turno actual si existe y es válido
        if (isValidId(turnoId)) {
          // Convertir explícitamente a número para evitar problemas de tipo
          const validTurnoId = toValidId(Number(turnoId));
          cashCountData.turnoId = validTurnoId;
          console.log(`[CASH_COUNTER] Asociando nuevo conteo al turno ID: ${cashCountData.turnoId}`);
        } else {
          console.warn(`[CASH_COUNTER] No se pudo asociar al turno, ID inválido: ${turnoId}`);
          // Eliminar explícitamente el campo turnoId para evitar el error "property turnoId should not exist"
          delete cashCountData.turnoId;
        }
      } else {
        console.warn('[CASH_COUNTER] No hay turno válido para asociar, el conteo se guardará sin asociación a turno');
        // Eliminar explícitamente el campo turnoId para evitar el error "property turnoId should not exist"
        delete cashCountData.turnoId;
      }
      
      // Asignar cada denominación a su campo correspondiente
      denominations.forEach(item => {
        const value = Number(item.value);
        const count = Number(item.quantity);
        const total = Number(item.total);
        
        if (isNaN(value) || isNaN(count) || isNaN(total)) {
          throw new Error('Los valores de las denominaciones deben ser números válidos');
        }
        
        // Asignar según la denominación
        switch (value) {
          case 500:
            cashCountData.deno500 = value;
            cashCountData.cant500 = count;
            cashCountData.total500 = total;
            break;
          case 200:
            cashCountData.deno200 = value;
            cashCountData.cant200 = count;
            cashCountData.total200 = total;
            break;
          case 100:
            cashCountData.deno100 = value;
            cashCountData.cant100 = count;
            cashCountData.total100 = total;
            break;
          case 50:
            cashCountData.deno50 = value;
            cashCountData.cant50 = count;
            cashCountData.total50 = total;
            break;
          case 20:
            cashCountData.deno20 = value;
            cashCountData.cant20 = count;
            cashCountData.total20 = total;
            break;
          case 10:
            cashCountData.deno10 = value;
            cashCountData.cant10 = count;
            cashCountData.total10 = total;
            break;
          case 5:
            cashCountData.deno5 = value;
            cashCountData.cant5 = count;
            cashCountData.total5 = total;
            break;
          case 2:
            cashCountData.deno2 = value;
            cashCountData.cant2 = count;
            cashCountData.total2 = total;
            break;
          case 1:
            cashCountData.deno1 = value;
            cashCountData.cant1 = count;
            cashCountData.total1 = total;
            break;
        }
      });
      
      let result;
      
      try {
        if (isEditMode && initialData && initialData.id) {
          // Validar que el ID sea un número válido
          if (!isValidId(initialData.id)) {
            throw new Error(`ID de conteo inválido: ${initialData.id}`);
          }
          
          // Si estamos en modo edición y tenemos un ID válido, actualizar el conteo existente
          console.log(`[CASH_COUNTER] Actualizando conteo existente ID ${initialData.id}:`, cashCountData);
          console.log(`[CASH_COUNTER] Total general enviado: ${cashCountData.totalGeneral}`);
          
          result = await cashApi.updateCashCount(initialData.id, cashCountData);
          console.log('[CASH_COUNTER] Conteo actualizado exitosamente:', result);
          setSnackbarMessage('Conteo de efectivo actualizado exitosamente');
        } else {
          // Si no estamos en modo edición o no tenemos un ID válido, crear un nuevo conteo
          console.log('[CASH_COUNTER] Guardando nuevo conteo:', cashCountData);
          console.log(`[CASH_COUNTER] Total general enviado: ${cashCountData.totalGeneral}`);
          
          result = await cashApi.saveCashCount(cashCountData);
          console.log('[CASH_COUNTER] Conteo guardado exitosamente:', result);
          setSnackbarMessage('Conteo de efectivo guardado exitosamente');
        }
      } catch (error: any) {
        console.error('[CASH_COUNTER] Error al guardar/actualizar conteo:', error);
        
        // Mostrar mensaje de error detallado
        let errorMessage = 'Error al procesar el conteo de efectivo';
        
        // Manejar errores específicos relacionados con la validación
        if (error.message) {
          if (error.message.includes('ID de usuario inválido')) {
            errorMessage = 'Error de autenticación: Usuario inválido';
            console.error('[CASH_COUNTER] Error de autenticación:', error.message);
          } else if (error.message.includes('Total general')) {
            errorMessage = 'Error en el total: Valor inválido';
            console.error('[CASH_COUNTER] Error en el total:', error.message);
          } else if (error.message.includes('ID de turno inválido')) {
            errorMessage = 'Error en el turno: ID inválido';
            console.error('[CASH_COUNTER] Error en el turno:', error.message);
          } else if (error.message.includes('ID de conteo inválido')) {
            errorMessage = 'Error en el conteo: ID inválido';
            console.error('[CASH_COUNTER] Error en el ID de conteo:', error.message);
          } else {
            errorMessage = `${errorMessage}: ${error.message}`;
          }
        }
        
        // Manejar errores de la API
        if (error.response) {
          console.error(`[CASH_COUNTER] Error de API: Status ${error.response.status}`);
          
          if (error.response.status === 400) {
            errorMessage = 'Datos inválidos en el conteo de efectivo';
          } else if (error.response.status === 401) {
            errorMessage = 'Sesión expirada, por favor inicie sesión nuevamente';
          } else if (error.response.status === 404) {
            errorMessage = 'No se encontró el conteo de efectivo para actualizar';
          } else if (error.response.status === 500) {
            errorMessage = 'Error interno del servidor';
          }
          
          if (error.response?.data?.message) {
            errorMessage = `${errorMessage} - ${error.response.data.message}`;
          }
        }
        
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return; // Salir de la función para evitar ejecutar el código de éxito
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Si hay una función onSave proporcionada, llamarla con los datos
      if (onSave) {
        onSave({
          denominations,
          total: totalCash
        });
      }
      
      // Limpiar el formulario automáticamente después de guardar exitosamente
      // Solo si no estamos en modo edición
      if (!isEditMode) {
        console.log('[CASH_COUNTER] Limpiando formulario después de guardar exitosamente');
        setDenominations(defaultDenominations);
        setTotalCash(0);
      }
    } catch (error) {
      console.error('[CASH_COUNTER] Error al guardar el conteo:', error);
      setSnackbarMessage(`Error al ${isEditMode ? 'actualizar' : 'guardar'} el conteo de efectivo`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Función para imprimir
  const handlePrint = () => {
    window.print();
  };

  // Cargar datos guardados al iniciar, primero intentando desde la base de datos
  useEffect(() => {
    if (!initialData) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Si hay datos iniciales, usarlos para inicializar el estado
      setDenominations(initialData.denominations || defaultDenominations);
      
      // Si hay un total inicial, usarlo
      if (initialData.totalCash !== undefined) {
        setTotalCash(initialData.totalCash);
      } else {
        // Calcular el total a partir de las denominaciones
        const newTotal = (initialData.denominations || []).reduce((sum, item) => sum + item.total, 0);
        setTotalCash(newTotal);
      }
    } catch (error) {
      console.error('[CASH_COUNTER] Error al cargar datos iniciales:', error);
    }
  }, [initialData]);
  
  // Manejar cambios en la cantidad de cada denominación
  const handleQuantityChange = (index: number, value: string) => {
    // Validar que el valor sea un número
    const quantity = value === '' ? 0 : parseInt(value, 10);
    
    if (isNaN(quantity)) {
      return;
    }
    
    setDenominations(prev => {
      const updated = [...prev];
      // Asegurar que tanto quantity como value sean números antes de calcular el total
      const safeQuantity = Number(quantity);
      const safeValue = Number(updated[index].value);
      updated[index] = {
        ...updated[index],
        quantity: safeQuantity,
        total: safeQuantity * safeValue
      };
      return updated;
    });
  };
  
  return (
    <>
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
            {denominations.map((item, index) => (
              <TableRow 
                key={item.value}
                sx={{ 
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                  height: '40px'
                }}
              >
                <TableCell padding="checkbox" sx={{ pl: 2 }}>{item.label}</TableCell>
                <TableCell padding="checkbox" sx={{ width: '100px' }}>
                  <TextField
                    type="number"
                    variant="outlined"
                    size="small"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    inputProps={{ 
                      min: 0,
                      style: { padding: '5px 8px', height: '15px' } 
                    }}
                    sx={{ width: '80px' }}
                    disabled={readOnly}
                  />
                </TableCell>
                <TableCell padding="checkbox">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="span" variant="body2" sx={{ mr: 0.5 }}>L</Typography>
                    <Typography component="span" variant="body2">{Number(item.total).toFixed(2)}</Typography>
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
                  <Typography component="span" variant="body1" fontWeight="bold">{Number(totalCash).toFixed(2)}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {!readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveToDatabase}
            disabled={isSaving || readOnly}
            startIcon={isSaving ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {isSaving ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      )}
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CashCounter;

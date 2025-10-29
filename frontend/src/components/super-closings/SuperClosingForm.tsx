import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSuperClosings } from '../../api/super-closings/superClosingsApi';
import { SuperClosingFormData } from '../../api/super-closings/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import { getTotalAmountByAcuerdoOrigen } from '../../api/additional-loan/additionalLoanApi';
import { useBalanceFlows } from '../../api/balance-flows/balanceFlowsApi';
import { useSuperExpenses } from '../../api/super-expenses/superExpensesApi';
import { useSuperBillCount } from '../../api/super-bill-count/superBillCountApi';
import { useSnackbar } from 'notistack';

const SuperClosingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  const { state: authState } = useAuth();
  const { turnosActivos } = useTurno();
  
  // Obtener el efectivo inicial del state de navegación si existe
  const efectivoInicialFromNavigation = location.state?.efectivoInicial || 0;
  const { loading, error, fetchSuperClosingById, createSuperClosing, updateSuperClosing, getLastInactiveClosingOfDay } = useSuperClosings();
  const { getSumSaldoVendido } = useBalanceFlows();
  const { getSumPagoProductosEfectivo, getSumGastosEfectivo } = useSuperExpenses();
  const { getLastActiveBillCount } = useSuperBillCount();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<SuperClosingFormData>({
    usuarioId: authState.user?.id || 0,
    efectivoInicial: efectivoInicialFromNavigation,
    adicionalCasa: 0,
    adicionalAgente: 0,
    ventaContado: 0,
    ventaCredito: 0,
    ventaPos: 0,
    transfOccidente: 0,
    transfAtlantida: 0,
    transfBac: 0,
    transfBanpais: 0,
    totalSpv: 0,
    abonoCredito: 0,
    ventaSaldo: 0,
    pagoProductos: 0,
    gastos: 0,
    prestaAgentes: 0,
    efectivoTotal: 0,
    efectivoCajaF: 0,
    efectivoCierreTurno: 0,
    faltanteSobrante: 0,
    fechaCierre: new Date(),
    activo: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConteoWarning, setShowConteoWarning] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [shouldRecalculate, setShouldRecalculate] = useState(false);
  const [isUpdatingValues, setIsUpdatingValues] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchCierre = async () => {
        setIsLoadingData(true);
        const cierre = await fetchSuperClosingById(parseInt(id));
        if (cierre) {
          // Cargar todos los datos del cierre existente sin recalcular campos calculados
          setFormData({
            ...cierre,
            fechaCierre: new Date(cierre.fechaCierre),
            // Preservar los valores calculados originales del registro
            totalSpv: cierre.totalSpv,
            efectivoTotal: cierre.efectivoTotal,
            faltanteSobrante: cierre.faltanteSobrante
          });
        }
        setIsLoadingData(false);
      };
      fetchCierre();
    } else {
      // Si es un nuevo cierre, cargar automáticamente el efectivo inicial y los valores de adicionales/préstamos
      cargarEfectivoInicial();
      cargarValoresAdicionalesPrestamos();
    }
  }, [isEditing, id, fetchSuperClosingById]);
  
  // Función para cargar el último conteo de billetes activo (por caja)
  const cargarUltimoConteoBilletes = async () => {
    try {
      // Obtener el cajaNumero del turno activo
      const cajaNumero = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
      
      console.log('[SUPER_CLOSING_FORM] Cargando último conteo de billetes - Caja:', cajaNumero);
      
      if (!cajaNumero) {
        console.warn('[SUPER_CLOSING_FORM] No hay turno activo con caja asignada. No se puede cargar conteo.');
        setFormData(prevData => ({
          ...prevData,
          efectivoCierreTurno: 0
        }));
        setShowConteoWarning(true);
        return;
      }
      
      const ultimoConteo = await getLastActiveBillCount(cajaNumero);
      
      if (ultimoConteo) {
        console.log('[SUPER_CLOSING_FORM] Conteo de billetes activo encontrado - Caja:', cajaNumero, 'Total:', ultimoConteo.totalGeneral);
        
        // Actualizar el campo efectivoCierreTurno con el totalGeneral del conteo
        setFormData(prevData => ({
          ...prevData,
          efectivoCierreTurno: ultimoConteo.totalGeneral
        }));
        
        // Ocultar la advertencia si se carga exitosamente
        setShowConteoWarning(false);
        
        console.log(`[SUPER_CLOSING_FORM] Efectivo Cierre Turno cargado automáticamente: ${ultimoConteo.totalGeneral}`);
      } else {
        console.log(`[SUPER_CLOSING_FORM] No se encontró conteo de billetes activo para Caja ${cajaNumero} - establecer en 0`);
        
        // Establecer efectivoCierreTurno en 0 cuando no hay conteo activo
        setFormData(prevData => ({
          ...prevData,
          efectivoCierreTurno: 0
        }));
        
        setShowConteoWarning(true);
      }
    } catch (error: any) {
      // Verificar si es un error 404 (no encontrado) para manejarlo silenciosamente
      if (error?.response?.status === 404) {
        console.log('No hay conteos de billetes activos disponibles - establecer en 0');
        
        // Establecer efectivoCierreTurno en 0 cuando no hay conteo disponible
        setFormData(prevData => ({
          ...prevData,
          efectivoCierreTurno: 0
        }));
        
        setShowConteoWarning(true);
      } else {
        // Solo mostrar errores que no sean 404
        console.error('Error inesperado al cargar el último conteo de billetes activo:', error);
        
        // En caso de error inesperado, también establecer en 0
        setFormData(prevData => ({
          ...prevData,
          efectivoCierreTurno: 0
        }));
        
        setShowConteoWarning(true);
      }
    }
  };

  // Función para cargar automáticamente el efectivo inicial (por caja)
  const cargarEfectivoInicial = async () => {
    try {
      // Obtener el cajaNumero del turno activo
      const cajaNumero = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
      
      console.log('[SUPER_CLOSING_FORM] Cargando efectivo inicial - Caja:', cajaNumero);
      
      if (!cajaNumero) {
        console.log('[SUPER_CLOSING_FORM] No hay turno activo con caja asignada. Usando 2000 por defecto');
        setFormData(prevData => ({
          ...prevData,
          efectivoInicial: 2000
        }));
        return;
      }
      
      // Consultar el último cierre inactivo de esta caja específica
      const ultimoCierreInactivo = await getLastInactiveClosingOfDay(cajaNumero);
      
      if (ultimoCierreInactivo && ultimoCierreInactivo.efectivoCierreTurno !== undefined) {
        // Si existe un cierre inactivo de esta caja, usar su efectivoCierreTurno
        const efectivoInicial = Number(ultimoCierreInactivo.efectivoCierreTurno) || 0;
        console.log(`[SUPER_CLOSING_FORM] Se encontró cierre inactivo de Caja ${cajaNumero}. Efectivo Inicial: ${efectivoInicial}`);
        
        setFormData(prevData => ({
          ...prevData,
          efectivoInicial: efectivoInicial
        }));
      } else {
        // Si no existe ningún cierre inactivo de esta caja, usar 2000 por defecto (primer cierre de la caja)
        console.log(`[SUPER_CLOSING_FORM] No se encontró cierre inactivo de Caja ${cajaNumero}. Efectivo Inicial: 2000 (primer cierre)`);
        
        setFormData(prevData => ({
          ...prevData,
          efectivoInicial: 2000
        }));
      }
    } catch (error) {
      console.error('[SUPER_CLOSING_FORM] Error al cargar efectivo inicial:', error);
      // En caso de error, usar 2000 por defecto
      setFormData(prevData => ({
        ...prevData,
        efectivoInicial: 2000
      }));
    }
  };

  // Función para cargar automáticamente los valores de adicionales, préstamos, venta saldo, pago productos y gastos (por caja)
  const cargarValoresAdicionalesPrestamos = async () => {
    try {
      // Obtener el cajaNumero del turno activo
      const cajaNumero = turnosActivos.length > 0 ? turnosActivos[0].cajaNumero : null;
      
      console.log('[SUPER_CLOSING_FORM] Cargando valores automáticos - Caja:', cajaNumero);
      
      if (!cajaNumero) {
        console.warn('[SUPER_CLOSING_FORM] No hay turno activo con caja asignada. No se pueden cargar valores automáticos.');
        return;
      }
      
      // 1. Cargar Adicional Casa (Acuerdo: Adicional, Origen: Casa) - Filtrado por caja
      const montoAdicionalCasa = await getTotalAmountByAcuerdoOrigen('Adicional', 'Casa', cajaNumero);
      
      // 2. Cargar Adicional Agente (Acuerdo: Adicional, Origen: Agente) - Filtrado por caja
      const montoAdicionalAgente = await getTotalAmountByAcuerdoOrigen('Adicional', 'Agente', cajaNumero);
      
      // 3. Cargar Préstamo Agente (Acuerdo: Préstamo, Origen: Agente) - Filtrado por caja
      // Intentar primero con tilde
      let montoPrestamoAgente = await getTotalAmountByAcuerdoOrigen('Préstamo', 'Agente', cajaNumero);
      
      // Si no hay resultados, intentar sin tilde
      if (montoPrestamoAgente === 0) {
        montoPrestamoAgente = await getTotalAmountByAcuerdoOrigen('Prestamo', 'Agente', cajaNumero);
      }
      
      // 4. Cargar Venta Saldo (suma de saldo_vendido de registros activos en tbl_flujos_saldo) - Filtrado por caja
      const montoVentaSaldo = await getSumSaldoVendido(cajaNumero);
      
      // 5. Cargar Pago Productos (suma de total de registros activos de tipo Pago de Productos y forma de pago Efectivo) - Filtrado por caja
      const montoPagoProductos = await getSumPagoProductosEfectivo(cajaNumero);
      
      // 6. Cargar Gastos (suma de total de registros activos de tipo Gasto y forma de pago Efectivo) - Filtrado por caja
      const montoGastos = await getSumGastosEfectivo(cajaNumero);
      
      // Actualizar el formulario con los valores obtenidos
      setFormData(prevData => ({
        ...prevData,
        adicionalCasa: montoAdicionalCasa,
        adicionalAgente: montoAdicionalAgente,
        prestaAgentes: montoPrestamoAgente,
        ventaSaldo: montoVentaSaldo,
        pagoProductos: montoPagoProductos,
        gastos: montoGastos
      }));
      
      console.log('Valores cargados automáticamente:', {
        adicionalCasa: montoAdicionalCasa,
        adicionalAgente: montoAdicionalAgente,
        prestaAgentes: montoPrestamoAgente,
        ventaSaldo: montoVentaSaldo,
        pagoProductos: montoPagoProductos,
        gastos: montoGastos
      });
      
      // Cargar el último conteo de billetes activo
      await cargarUltimoConteoBilletes();
    } catch (error) {
      console.error('Error al cargar valores de adicionales, préstamos, venta saldo, pago productos y gastos:', error);
    }
  };

  useEffect(() => {
    // Solo calcular automáticamente si no estamos cargando datos de un cierre existente Y (no estamos editando O el usuario activó el recálculo)
    if (!isLoadingData && (!isEditing || shouldRecalculate)) {
      // Calcular totalSpv - asegurar que todos los valores sean números
      const totalSpv = 
        Number(formData.ventaContado || 0) +
        Number(formData.ventaCredito || 0) +
        Number(formData.ventaPos || 0) +
        Number(formData.transfOccidente || 0) +
        Number(formData.transfAtlantida || 0) +
        Number(formData.transfBac || 0) +
        Number(formData.transfBanpais || 0);
      
      setFormData(prev => ({
        ...prev,
        totalSpv
      }));
      
      // Resetear el flag de recálculo después de calcular
      if (shouldRecalculate) {
        setShouldRecalculate(false);
      }
    }
  }, [
    formData.ventaContado,
    formData.ventaCredito,
    formData.ventaPos,
    formData.transfOccidente,
    formData.transfAtlantida,
    formData.transfBac,
    formData.transfBanpais,
    isLoadingData,
    isEditing,
    shouldRecalculate
  ]);

  useEffect(() => {
    // Solo calcular automáticamente si no estamos cargando datos de un cierre existente Y (no estamos editando O el usuario activó el recálculo)
    if (!isLoadingData && (!isEditing || shouldRecalculate)) {
      // Calcular efectivoTotal - asegurar que todos los valores sean números
      const efectivoTotal = 
        Number(formData.efectivoInicial || 0) +
        Number(formData.adicionalCasa || 0) +
        Number(formData.adicionalAgente || 0) +
        Number(formData.ventaContado || 0) +
        Number(formData.abonoCredito || 0) +
        Number(formData.ventaSaldo || 0) -
        Number(formData.pagoProductos || 0) -
        Number(formData.gastos || 0) -
        Number(formData.prestaAgentes || 0);
      
      // Calcular faltanteSobrante
      const faltanteSobrante = Number(formData.efectivoCierreTurno || 0) - efectivoTotal;
      
      setFormData(prev => ({
        ...prev,
        efectivoTotal,
        faltanteSobrante
      }));
      
      // Resetear el flag de recálculo después de calcular
      if (shouldRecalculate) {
        setShouldRecalculate(false);
      }
    }
  }, [
    formData.efectivoInicial,
    formData.adicionalCasa,
    formData.adicionalAgente,
    formData.ventaContado,
    formData.abonoCredito,
    formData.ventaSaldo,
    formData.pagoProductos,
    formData.gastos,
    formData.prestaAgentes,
    formData.efectivoCierreTurno,
    isLoadingData,
    isEditing,
    shouldRecalculate
  ]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.usuarioId) {
      errors.usuarioId = 'El usuario es requerido';
    }
    
    if (formData.efectivoInicial < 0) {
      errors.efectivoInicial = 'El efectivo inicial no puede ser negativo';
    }
    
    if (!formData.fechaCierre) {
      errors.fechaCierre = 'La fecha de cierre es requerida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      // Asegurar que el valor sea un número válido
      const numericValue = value === '' ? 0 : parseFloat(value);
      const validValue = isNaN(numericValue) ? 0 : numericValue;
      
      setFormData(prev => ({ ...prev, [name]: validValue }));
      
      // Si estamos editando y se modifica un campo que afecta los cálculos, activar recálculo
      if (isEditing) {
        const fieldsAffectingCalculations = [
          'efectivoInicial', 'adicionalCasa', 'adicionalAgente', 'ventaContado', 
          'ventaCredito', 'ventaPos', 'transfOccidente', 'transfAtlantida', 
          'transfBac', 'transfBanpais', 'abonoCredito', 'ventaSaldo', 
          'pagoProductos', 'gastos', 'prestaAgentes', 'efectivoCierreTurno'
        ];
        
        if (fieldsAffectingCalculations.includes(name)) {
          // Usar setTimeout para asegurar que el estado se actualice antes del recálculo
          setTimeout(() => setShouldRecalculate(true), 0);
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Limpiar error del campo cuando se modifica
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, fechaCierre: date || new Date() });
    if (formErrors.fechaCierre) {
      setFormErrors({ ...formErrors, fechaCierre: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && id) {
        console.log('[SUPER_CLOSING_FORM] Actualizando cierre y asociando registros nuevos...');
        await updateSuperClosing(parseInt(id), formData);
        enqueueSnackbar('Cierre actualizado correctamente. Los registros nuevos han sido asociados.', { 
          variant: 'success',
          autoHideDuration: 4000 
        });
      } else {
        await createSuperClosing(formData);
        enqueueSnackbar('Cierre creado correctamente', { variant: 'success' });
      }
      navigate('/cierres-super');
    } catch (error: any) {
      console.error('[SUPER_CLOSING_FORM] Error al guardar:', error);
      
      // Extraer mensaje de error del backend
      let errorMessage = 'Error al guardar el cierre';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para actualizar valores automáticos en modo edición
  const handleActualizarValoresAutomaticos = async () => {
    setIsUpdatingValues(true);
    try {
      // Cargar los valores actualizados de adicionales, préstamos, venta saldo, etc.
      await cargarValoresAdicionalesPrestamos();
      
      // Activar recálculo de campos calculados
      setShouldRecalculate(true);
      
      console.log('Valores automáticos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar valores automáticos:', error);
      alert('Error al actualizar los valores automáticos');
    } finally {
      setIsUpdatingValues(false);
    }
  };

  const handleCancel = () => {
    navigate('/cierres-super');
  };

  if (loading && isEditing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h5" mb={3}>
          {isEditing ? 'Editar Cierre de Super' : 'Nuevo Cierre de Super'}
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Usuario"
                name="usuarioId"
                value={authState.user?.nombre || 'Usuario no disponible'}
                error={!!formErrors.usuarioId}
                helperText={formErrors.usuarioId}
                InputProps={{
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Fecha y Hora de Cierre"
                value={formData.fechaCierre}
                onChange={handleDateChange}
                readOnly
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: !!formErrors.fechaCierre,
                    helperText: formErrors.fechaCierre,
                    InputProps: {
                      readOnly: true,
                    }
                  } 
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Ingresos</Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Efectivo Inicial"
                name="efectivoInicial"
                type="number"
                value={formData.efectivoInicial}
                onChange={handleInputChange}
                error={!!formErrors.efectivoInicial}
                helperText={formErrors.efectivoInicial}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Adicional Casa"
                name="adicionalCasa"
                type="number"
                value={formData.adicionalCasa}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Adicional Agente"
                name="adicionalAgente"
                type="number"
                value={formData.adicionalAgente}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Venta Contado"
                name="ventaContado"
                type="number"
                value={formData.ventaContado}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Venta Crédito"
                name="ventaCredito"
                type="number"
                value={formData.ventaCredito}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Venta POS"
                name="ventaPos"
                type="number"
                value={formData.ventaPos}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Transferencias</Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Transferencia Occidente"
                name="transfOccidente"
                type="number"
                value={formData.transfOccidente}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Transferencia Atlántida"
                name="transfAtlantida"
                type="number"
                value={formData.transfAtlantida}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Transferencia BAC"
                name="transfBac"
                type="number"
                value={formData.transfBac}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Transferencia Banpaís"
                name="transfBanpais"
                type="number"
                value={formData.transfBanpais}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Otros Ingresos</Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total SPV (Calculado)"
                name="totalSpv"
                type="number"
                value={formData.totalSpv}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
                helperText="Suma de Venta Contado, Venta Crédito, Venta POS y Transferencias"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Abono Crédito"
                name="abonoCredito"
                type="number"
                value={formData.abonoCredito}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Venta Saldo"
                name="ventaSaldo"
                type="number"
                value={formData.ventaSaldo}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Egresos</Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pago Productos"
                name="pagoProductos"
                type="number"
                value={formData.pagoProductos}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Gastos"
                name="gastos"
                type="number"
                value={formData.gastos}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Préstamos a Agentes"
                name="prestaAgentes"
                type="number"
                value={formData.prestaAgentes}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Totales y Cierre</Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Efectivo Total (Calculado)"
                name="efectivoTotal"
                type="number"
                value={formData.efectivoTotal}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Efectivo en Caja Fuerte"
                name="efectivoCajaF"
                type="number"
                value={formData.efectivoCajaF}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Efectivo Cierre Turno"
                name="efectivoCierreTurno"
                type="number"
                value={formData.efectivoCierreTurno}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
              {showConteoWarning && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'error.main',
                    mt: 0.5,
                    display: 'block',
                    fontSize: '0.75rem'
                  }}
                >
                  Debes realizar el conteo de efectivo
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Faltante/Sobrante (Calculado)"
                name="faltanteSobrante"
                type="number"
                value={formData.faltanteSobrante}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                  readOnly: true,
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={handleInputChange}
                    name="activo"
                    color="primary"
                  />
                }
                label="Activo"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                {/* Botón de actualizar valores automáticos en la esquina izquierda */}
                {isEditing && (
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={handleActualizarValoresAutomaticos}
                    disabled={isUpdatingValues}
                    startIcon={isUpdatingValues ? <CircularProgress size={14} /> : undefined}
                    sx={{ 
                      fontSize: '0.75rem',
                      textTransform: 'none'
                    }}
                  >
                    {isUpdatingValues ? 'Actualizando...' : 'Actualizar Valores Automáticos'}
                  </Button>
                )}
                
                {/* Botones principales en la derecha */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : isEditing ? 'Actualizar' : 'Guardar'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default SuperClosingForm;

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
import { useNavigate, useParams } from 'react-router-dom';
import { useCierresSuper } from '../../api/cierres-super/cierresSuperApi';
import { CierreSuperFormData } from '../../api/cierres-super/types';
import { useAuth } from '../../contexts/AuthContext';
import { getMontoTotalByAcuerdoOrigen } from '../../api/adicionales-prestamos/adicionalesPrestamosApi';
import { useBalanceFlows } from '../../api/balance-flows/balanceFlowsApi';
import { useSuperExpenses } from '../../api/super-expenses/superExpensesApi';
import { useConteoBilletesSuper } from '../../api/conteo-billetes-super/conteoBilletesSuperApi';

const CierreSuperForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { state: authState } = useAuth();
  const { loading, error, fetchCierreSuperById, createCierreSuper, updateCierreSuper } = useCierresSuper();
  const { getSumSaldoVendido } = useBalanceFlows();
  const { getSumPagoProductosEfectivo, getSumGastosEfectivo } = useSuperExpenses();
  const { getLastActiveConteoBilletes } = useConteoBilletesSuper();

  const [formData, setFormData] = useState<CierreSuperFormData>({
    usuarioId: authState.user?.id || 0,
    efectivoInicial: 0,
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

  useEffect(() => {
    if (isEditing && id) {
      const fetchCierre = async () => {
        const cierre = await fetchCierreSuperById(parseInt(id));
        if (cierre) {
          setFormData({
            ...cierre,
            fechaCierre: new Date(cierre.fechaCierre),
          });
        }
      };
      fetchCierre();
    } else {
      // Si es un nuevo cierre, cargar automáticamente los valores de adicionales y préstamos
      cargarValoresAdicionalesPrestamos();
    }
  }, [isEditing, id, fetchCierreSuperById]);
  
  // Función para cargar el último conteo de billetes activo
  const cargarUltimoConteoBilletes = async () => {
    try {
      const ultimoConteo = await getLastActiveConteoBilletes();
      
      if (ultimoConteo) {
        console.log('Conteo de billetes activo encontrado:', ultimoConteo);
        
        // Actualizar el campo efectivoCierreTurno con el totalGeneral del conteo
        setFormData(prevData => ({
          ...prevData,
          efectivoCierreTurno: ultimoConteo.totalGeneral
        }));
        
        console.log(`Efectivo Cierre Turno cargado automáticamente: ${ultimoConteo.totalGeneral}`);
      } else {
        console.log('No se encontró ningún conteo de billetes activo');
      }
    } catch (error) {
      console.error('Error al cargar el último conteo de billetes activo:', error);
    }
  };

  // Función para cargar automáticamente los valores de adicionales, préstamos, venta saldo, pago productos y gastos
  const cargarValoresAdicionalesPrestamos = async () => {
    try {
      // 1. Cargar Adicional Casa (Acuerdo: Adicional, Origen: Casa)
      const montoAdicionalCasa = await getMontoTotalByAcuerdoOrigen('Adicional', 'Casa');
      
      // 2. Cargar Adicional Agente (Acuerdo: Adicional, Origen: Agente)
      const montoAdicionalAgente = await getMontoTotalByAcuerdoOrigen('Adicional', 'Agente');
      
      // 3. Cargar Préstamo Agente (Acuerdo: Préstamo, Origen: Agente)
      // Intentar primero con tilde
      let montoPrestamoAgente = await getMontoTotalByAcuerdoOrigen('Préstamo', 'Agente');
      
      // Si no hay resultados, intentar sin tilde
      if (montoPrestamoAgente === 0) {
        montoPrestamoAgente = await getMontoTotalByAcuerdoOrigen('Prestamo', 'Agente');
      }
      
      // 4. Cargar Venta Saldo (suma de saldo_vendido de registros activos en tbl_flujos_saldo)
      const montoVentaSaldo = await getSumSaldoVendido();
      
      // 5. Cargar Pago Productos (suma de total de registros activos de tipo Pago de Productos y forma de pago Efectivo)
      const montoPagoProductos = await getSumPagoProductosEfectivo();
      
      // 6. Cargar Gastos (suma de total de registros activos de tipo Gasto y forma de pago Efectivo)
      const montoGastos = await getSumGastosEfectivo();
      
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

  // Función para calcular el Total SPV
  const calcularTotalSPV = (): number => {
    return (
      formData.ventaContado +
      formData.ventaCredito +
      formData.ventaPos +
      formData.transfOccidente +
      formData.transfAtlantida +
      formData.transfBac +
      formData.transfBanpais
    );
  };

  // Actualizar Total SPV cuando cambien los campos relacionados
  useEffect(() => {
    const totalSpv = calcularTotalSPV();
    
    setFormData(prev => ({
      ...prev,
      totalSpv
    }));
  }, [
    formData.ventaContado,
    formData.ventaCredito,
    formData.ventaPos,
    formData.transfOccidente,
    formData.transfAtlantida,
    formData.transfBac,
    formData.transfBanpais
  ]);

  useEffect(() => {
    // Calcular efectivoTotal
    const efectivoTotal = 
      formData.efectivoInicial +
      formData.adicionalCasa +
      formData.adicionalAgente +
      formData.ventaContado +
      formData.abonoCredito +
      formData.ventaSaldo -
      formData.pagoProductos -
      formData.gastos -
      formData.prestaAgentes;
    
    // Calcular faltanteSobrante
    const faltanteSobrante = formData.efectivoCierreTurno - efectivoTotal;
    
    setFormData(prev => ({
      ...prev,
      efectivoTotal,
      faltanteSobrante
    }));
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
    formData.efectivoCierreTurno
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
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
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
        await updateCierreSuper(parseInt(id), formData);
      } else {
        await createCierreSuper(formData);
      }
      navigate('/cierres-super');
    } catch (error: any) {
      setSubmitError(error.message || 'Error al guardar el cierre');
    } finally {
      setIsSubmitting(false);
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
                label="ID de Usuario"
                name="usuarioId"
                type="number"
                value={formData.usuarioId}
                onChange={handleInputChange}
                error={!!formErrors.usuarioId}
                helperText={formErrors.usuarioId}
                disabled={isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Fecha y Hora de Cierre"
                value={formData.fechaCierre}
                onChange={handleDateChange}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    error: !!formErrors.fechaCierre,
                    helperText: formErrors.fechaCierre
                  } 
                }}
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
                }}
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
                }}
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
                }}
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
                }}
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
                }}
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
                }}
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
                }}
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
                }}
              />
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
              <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
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
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default CierreSuperForm;

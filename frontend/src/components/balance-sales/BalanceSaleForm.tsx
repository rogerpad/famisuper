import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import { useBalanceSales } from '../../api/balance-sales/balanceSalesApi';
import { BalanceSale, BalanceSaleFormData } from '../../api/balance-sales/types';
import { useAuth } from '../../contexts/AuthContext';

// Importar hooks para obtener líneas telefónicas, flujos de saldo y paquetes
import { usePhoneLines } from '../../api/phoneLines/phoneLinesApi';
import { useBalanceFlows } from '../../api/balance-flows/balanceFlowsApi';
import { usePackages } from '../../api/packages/packagesApi';
import { PhoneLine } from '../../api/phoneLines/types';
import { BalanceFlow } from '../../api/balance-flows/types';
import { Package } from '../../api/packages/types';

const BalanceSaleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== 'new' && id !== undefined;
  const { state: authState } = useAuth();
  
  const { loading: loadingBalanceSale, error: balanceSaleError, fetchBalanceSaleById, createBalanceSale, updateBalanceSale } = useBalanceSales();
  const { loading: loadingPhoneLines, phoneLines, fetchPhoneLines } = usePhoneLines();
  const { loading: loadingBalanceFlows, balanceFlows, fetchBalanceFlows } = useBalanceFlows();
  const { loading: loadingPackages, error: packagesError, fetchPackages } = usePackages();
  const [packages, setPackages] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<BalanceSaleFormData>({
    usuarioId: authState.user?.id || 0,
    telefonicaId: 0,
    flujoSaldoId: 0,
    paqueteId: undefined,
    cantidad: 1,
    monto: 0,
    fecha: new Date(),
    observacion: '',
    activo: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Cargar líneas telefónicas, flujos de saldo y paquetes al montar el componente
  useEffect(() => {
    fetchPhoneLines();
    fetchBalanceFlows();
    loadPackages();
  }, []);
  
  // Función para cargar los paquetes
  const loadPackages = async () => {
    try {
      const packagesData = await fetchPackages();
      setPackages(packagesData);
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
    }
  };

  // Cargar datos de la venta si estamos en modo edición
  useEffect(() => {
    if (isEditMode && id) {
      loadBalanceSale(parseInt(id));
    }
  }, [id, isEditMode]);
  
  // Efecto para cargar datos cuando los selectores estén listos
  useEffect(() => {
    if (phoneLines?.length > 0 && balanceFlows?.length > 0 && isEditMode && id) {
      console.log('Selectores cargados, recargando datos...');
      loadBalanceSale(parseInt(id));
    }
  }, [phoneLines, balanceFlows, isEditMode, id]);
  
  const loadBalanceSale = async (balanceSaleId: number) => {
    try {
      const balanceSale = await fetchBalanceSaleById(balanceSaleId);
      if (balanceSale) {
        console.log('Datos recibidos del backend:', balanceSale);
        
        // Forzar la conversión de todos los campos numéricos
        const telefonicaId = Number(balanceSale.telefonicaId);
        const flujoSaldoId = Number(balanceSale.flujoSaldoId);
        const paqueteId = balanceSale.paqueteId ? Number(balanceSale.paqueteId) : undefined;
        
        console.log('Valores convertidos:', { 
          telefonicaId, 
          flujoSaldoId, 
          paqueteId 
        });
        
        // Actualizar el estado con un timeout para asegurar que los selectores se actualicen
        setTimeout(() => {
          setFormData({
            usuarioId: Number(balanceSale.usuarioId),
            telefonicaId: telefonicaId,
            flujoSaldoId: flujoSaldoId,
            paqueteId: paqueteId,
            cantidad: Number(balanceSale.cantidad),
            monto: Number(balanceSale.monto),
            fecha: new Date(balanceSale.fecha),
            observacion: balanceSale.observacion || '',
            activo: balanceSale.activo,
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error al cargar la venta de saldo:', error);
    }
  };
  
  // Función para calcular el monto basado en la cantidad y el precio del paquete
  const calculateAmount = (packageId: number | undefined, quantity: number): number => {
    if (!packageId) return 0;
    
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) return 0;
    
    return Number(selectedPackage.precio) * quantity;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si cambia la cantidad, recalcular el monto si hay un paquete seleccionado
    if (name === 'cantidad' && formData.paqueteId) {
      const newQuantity = parseFloat(value) || 0;
      const newAmount = calculateAmount(formData.paqueteId, newQuantity);
      
      setFormData({
        ...formData,
        cantidad: newQuantity,
        monto: newAmount
      });
    } else if (name === 'cantidad') {
      // Para el campo cantidad siempre convertir a número
      setFormData({
        ...formData,
        cantidad: parseFloat(value) || 0,
      });
    } else if (name === 'monto') {
      // Para el campo monto siempre convertir a número
      setFormData({
        ...formData,
        monto: parseFloat(value) || 0,
      });
    } else {
      // Para otros campos (como observacion) mantener como string
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    console.log(`Select change - name: ${name}, value: ${value}, type: ${typeof value}`);
    
    // Si cambia el paquete, recalcular el monto
    if (name === 'paqueteId') {
      // Convertir el valor a número o undefined si está vacío
      const packageId = value === '' ? undefined : Number(value);
      const newAmount = calculateAmount(packageId, formData.cantidad);
      
      setFormData({
        ...formData,
        paqueteId: packageId,
        monto: newAmount
      });
    } else if (name === 'telefonicaId' || name === 'flujoSaldoId') {
      // Para campos numéricos, asegurar que sean números
      const numericValue = value === '' ? 0 : Number(value);
      console.log(`Convirtiendo ${name} a número: ${numericValue}`);
      
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      // Para otros campos, mantener el valor original
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        fecha: date // Siempre guardamos como Date en el estado del formulario
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!authState.user?.id) {
      newErrors.usuarioId = 'No hay usuario en la sesión actual';
    }
    
    if (!formData.telefonicaId) {
      newErrors.telefonicaId = 'La línea telefónica es requerida';
    }
    
    if (!formData.flujoSaldoId) {
      newErrors.flujoSaldoId = 'El flujo de saldo es requerido';
    }
    
    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    
    if (!formData.monto || formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mostrar el estado actual del formulario antes de validar
    console.log('Estado del formulario antes de enviar:', formData);
    console.log('Tipo de telefonicaId:', typeof formData.telefonicaId, formData.telefonicaId);
    console.log('Tipo de flujoSaldoId:', typeof formData.flujoSaldoId, formData.flujoSaldoId);
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Crear una copia del objeto para no modificar el estado original
      const dataToSubmit = {
        // Forzar la conversión de todos los campos numéricos
        usuarioId: Number(authState.user?.id || 0),
        telefonicaId: Number(formData.telefonicaId),
        flujoSaldoId: Number(formData.flujoSaldoId),
        paqueteId: formData.paqueteId !== undefined ? Number(formData.paqueteId) : undefined,
        cantidad: Number(formData.cantidad),
        monto: Number(formData.monto),
        // Mantener fecha como Date para cumplir con la interfaz BalanceSale
        fecha: formData.fecha instanceof Date ? formData.fecha : new Date(formData.fecha),
        observacion: formData.observacion || '',
        activo: Boolean(formData.activo)
      };
      
      console.log('Datos convertidos a enviar:', dataToSubmit);
      
      if (isEditMode && id) {
        const result = await updateBalanceSale(parseInt(id), dataToSubmit);
        console.log('Resultado de la actualización:', result);
      } else {
        await createBalanceSale(dataToSubmit);
      }
      navigate('/balance-sales');
    } catch (error) {
      console.error('Error al guardar venta de saldo:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/balance-sales');
  };
  
  const isLoading = loadingBalanceSale || loadingPhoneLines || loadingBalanceFlows || loadingPackages;
  
  if (isLoading && isEditMode) {
    return <Typography>Cargando datos...</Typography>;
  }
  
  if (balanceSaleError) {
    return <Typography color="error">Error: {balanceSaleError}</Typography>;
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>
        {isEditMode ? 'Editar Venta de Saldo' : 'Nueva Venta de Saldo'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Usuario"
              value={authState.user ? `${authState.user.nombre} ${authState.user.apellido || ''}` : 'Usuario actual'}
              fullWidth
              disabled={true}
              InputProps={{
                readOnly: true,
              }}
              helperText="Se utilizará automáticamente el usuario de la sesión actual"
            />
            <input type="hidden" name="usuarioId" value={authState.user?.id || 0} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.telefonicaId}>
              <InputLabel>Línea Telefónica</InputLabel>
              <Select
                key={`telefonicaId-${formData.telefonicaId}`}
                name="telefonicaId"
                value={formData.telefonicaId || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  console.log('Seleccionado telefonicaId:', value);
                  setFormData(prev => ({
                    ...prev,
                    telefonicaId: value
                  }));
                }}
                label="Línea Telefónica"
                disabled={submitting}
              >
                {phoneLines?.map((phoneLine: PhoneLine) => (
                  <MenuItem key={phoneLine.id} value={phoneLine.id}>
                    {phoneLine.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errors.telefonicaId && <FormHelperText>{errors.telefonicaId}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.flujoSaldoId}>
              <InputLabel>Flujo de Saldo</InputLabel>
              <Select
                key={`flujoSaldoId-${formData.flujoSaldoId}`}
                name="flujoSaldoId"
                value={formData.flujoSaldoId || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  console.log('Seleccionado flujoSaldoId:', value);
                  setFormData(prev => ({
                    ...prev,
                    flujoSaldoId: value
                  }));
                }}
                label="Flujo de Saldo"
                disabled={submitting}
              >
                {balanceFlows?.map((flow: BalanceFlow) => (
                  <MenuItem key={flow.id} value={flow.id}>
                    {flow.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errors.flujoSaldoId && <FormHelperText>{errors.flujoSaldoId}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Paquete (opcional)</InputLabel>
              <Select
                key={`paqueteId-${formData.paqueteId}`}
                name="paqueteId"
                value={formData.paqueteId !== undefined ? formData.paqueteId : ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  console.log('Seleccionado paqueteId:', value);
                  const newAmount = calculateAmount(value, formData.cantidad);
                  setFormData(prev => ({
                    ...prev,
                    paqueteId: value,
                    monto: newAmount
                  }));
                }}
                label="Paquete (opcional)"
                disabled={submitting}
              >
                <MenuItem value="">Ninguno</MenuItem>
                {packages?.map((pkg: Package) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.nombre} (${pkg.precio})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="cantidad"
              label="Cantidad"
              type="number"
              fullWidth
              required
              value={formData.cantidad}
              onChange={handleInputChange}
              error={!!errors.cantidad}
              helperText={errors.cantidad}
              disabled={submitting}
              inputProps={{ min: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="monto"
              label="Monto"
              type="number"
              fullWidth
              required
              value={formData.monto}
              onChange={handleInputChange}
              error={!!errors.monto}
              helperText={errors.monto || (formData.paqueteId ? 'Calculado automáticamente' : '')}
              disabled={submitting || !!formData.paqueteId}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DateTimePicker
                label="Fecha"
                value={formData.fecha instanceof Date ? formData.fecha : new Date(formData.fecha)}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.fecha,
                    helperText: errors.fecha,
                    disabled: submitting,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="observacion"
              label="Observación"
              multiline
              rows={3}
              fullWidth
              value={formData.observacion}
              onChange={handleInputChange}
              disabled={submitting}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
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
                {submitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Guardar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BalanceSaleForm;

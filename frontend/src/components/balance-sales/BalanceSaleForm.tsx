import React, { useEffect, useState, useCallback } from 'react';
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
  const { loading: loadingBalanceFlows, balanceFlows, fetchBalanceFlows, fetchBalanceFlowById, recalcularSaldosVendidos } = useBalanceFlows();
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
  
  // Guardar el monto original para comparar al editar
  const [originalMonto, setOriginalMonto] = useState<number>(0);
  
  // Cargar líneas telefónicas, flujos de saldo y paquetes al montar el componente
  useEffect(() => {
    fetchPhoneLines();
    fetchBalanceFlows();
    loadPackages();
  }, [fetchPhoneLines, fetchBalanceFlows]); // Agregar dependencias para evitar loops
  
  // Función para cargar los paquetes, opcionalmente filtrados por línea telefónica
  const loadPackages = useCallback(async (telefonicaId?: number) => {
    try {
      const packagesData = await fetchPackages();
      
      // Si se proporciona un ID de línea telefónica, filtrar los paquetes
      if (telefonicaId && telefonicaId > 0) {
        console.log(`[BalanceSaleForm] Filtrando paquetes por línea telefónica ID: ${telefonicaId}`);
        const filteredPackages = packagesData.filter(pkg => pkg.telefonicaId === telefonicaId);
        setPackages(filteredPackages);
        console.log(`[BalanceSaleForm] Paquetes filtrados: ${filteredPackages.length} de ${packagesData.length}`);
      } else {
        // Si no hay filtro, mostrar todos los paquetes
        setPackages(packagesData);
      }
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
    }
  }, [fetchPackages]); // Memoizar la función
  
  // Función para asignar el flujo de saldo según la línea telefónica seleccionada
  const asignarFlujoSegunLinea = useCallback((telefonicaId: number) => {
    console.log('[BalanceSaleForm] Asignando flujo según línea telefónica ID:', telefonicaId);
    
    // Buscar flujos de saldo que coincidan con la línea telefónica seleccionada
    const flujosFiltrados = balanceFlows.filter(flow => {
      // Buscar flujos cuyo nombre contenga el nombre de la línea telefónica
      const linea = phoneLines.find(line => line.id === telefonicaId);
      if (!linea) return false;
      
      const lineaNombre = linea.nombre.toLowerCase();
      const flujoNombre = flow.nombre.toLowerCase();
      
      // Verificar si el nombre del flujo contiene el nombre de la línea
      if (lineaNombre.includes('tigo') && flujoNombre.includes('tigo')) {
        console.log('[BalanceSaleForm] Encontrado flujo Tigo:', flow.nombre);
        return true;
      }
      
      if (lineaNombre.includes('claro') && flujoNombre.includes('claro')) {
        console.log('[BalanceSaleForm] Encontrado flujo Claro:', flow.nombre);
        return true;
      }
      
      return false;
    });
    
    // Si se encontró algún flujo, devolver el ID del primero
    if (flujosFiltrados.length > 0) {
      console.log('[BalanceSaleForm] Flujo seleccionado automáticamente:', flujosFiltrados[0].nombre);
      return flujosFiltrados[0].id;
    }
    
    // Si no se encontró ningún flujo, devolver 0
    console.log('[BalanceSaleForm] No se encontró ningún flujo para la línea seleccionada');
    return 0;
  }, [balanceFlows, phoneLines]); // Memoizar la función con dependencias

  // Referencia para controlar si ya se cargó la venta
  const ventaCargadaRef = React.useRef(false);

  // Cargar datos de la venta si estamos en modo edición
  useEffect(() => {
    // Evitar cargas múltiples usando una referencia
    if (isEditMode && id && !ventaCargadaRef.current) {
      // Marcar como cargado inmediatamente para evitar múltiples ejecuciones
      ventaCargadaRef.current = true;
      
      console.log('[BalanceSaleForm] Iniciando carga de venta con ID:', id);
      
      const loadBalanceSale = async () => {
        try {
          const balanceSale = await fetchBalanceSaleById(parseInt(id));
          if (balanceSale) {
            console.log('[BalanceSaleForm] Venta de saldo cargada una sola vez:', balanceSale);
            // Guardar el monto original para usarlo en la actualización del flujo de saldo
            setOriginalMonto(balanceSale.monto);
            
            // Primero cargar los paquetes filtrados por la línea telefónica de la venta
            await loadPackages(balanceSale.telefonicaId);
            
            setFormData({
              usuarioId: balanceSale.usuarioId,
              telefonicaId: balanceSale.telefonicaId,
              flujoSaldoId: balanceSale.flujoSaldoId,
              paqueteId: balanceSale.paqueteId,
              cantidad: balanceSale.cantidad,
              monto: balanceSale.monto,
              fecha: balanceSale.fecha,
              observacion: balanceSale.observacion || '',
              activo: balanceSale.activo
            });
          }
        } catch (error) {
          console.error('[BalanceSaleForm] Error al cargar venta:', error);
        }
      };
      
      loadBalanceSale();
    }
    
    // Limpiar la referencia cuando el componente se desmonte
    return () => {
      // No reseteamos ventaCargadaRef.current = false aquí para evitar recargas
    };
  }, [id, isEditMode, loadPackages]); // Agregamos loadPackages a las dependencias
  
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
    } else if (name === 'telefonicaId') {
      // Para línea telefónica, asegurar que sea número
      const numericValue = value === '' ? 0 : Number(value);
      console.log(`Convirtiendo ${name} a número: ${numericValue}`);
      
      // Asignar automáticamente el flujo de saldo correspondiente
      const flujoSaldoId = numericValue > 0 ? asignarFlujoSegunLinea(numericValue) : 0;
      console.log(`[BalanceSaleForm] Flujo de saldo asignado automáticamente: ${flujoSaldoId}`);
      
      // Actualizar el estado del formulario
      setFormData({
        ...formData,
        [name]: numericValue,
        // Asignar automáticamente el flujo de saldo
        flujoSaldoId: flujoSaldoId,
        // Resetear el paquete seleccionado cuando cambia la línea telefónica
        paqueteId: undefined,
        // Si había un monto calculado por paquete, resetearlo también
        monto: formData.paqueteId ? 0 : formData.monto
      });
      
      // Cargar los paquetes filtrados por la línea telefónica seleccionada
      loadPackages(numericValue);
    } else if (name === 'flujoSaldoId') {
      // Para flujo de saldo, asegurar que sea número
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
  
  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    
    // Limpiar errores anteriores
    setErrors({});
    
    if (!authState.user?.id) {
      newErrors.usuarioId = 'No hay usuario en la sesión actual';
    }
    
    if (!formData.telefonicaId) {
      newErrors.telefonicaId = 'La línea telefónica es requerida';
    }
    
    if (!formData.flujoSaldoId) {
      newErrors.flujoSaldoId = 'El flujo de saldo es requerido';
    }
    
    if (!formData.paqueteId) {
      newErrors.paqueteId = 'El paquete es requerido';
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
    
    // Verificar que haya suficiente saldo disponible
    if (formData.flujoSaldoId && formData.monto > 0) {
      try {
        const flujoSaldo = await fetchBalanceFlowById(formData.flujoSaldoId);
        if (flujoSaldo) {
          if (!flujoSaldo.activo) {
            newErrors.flujoSaldoId = 'El flujo de saldo seleccionado no está activo';
          } else {
            // Si es modo edición, verificar que haya suficiente saldo para la diferencia
            if (isEditMode) {
              // Calcular la diferencia entre el monto nuevo y el original
              const diferencia = Number(formData.monto) - Number(originalMonto);
              
              // Solo verificar si el nuevo monto es mayor que el original
              if (diferencia > 0 && Number(flujoSaldo.saldoFinal) < diferencia) {
                newErrors.monto = `No hay suficiente saldo disponible para el incremento. Saldo actual: L. ${flujoSaldo.saldoFinal}`;
              }
            } else if (Number(flujoSaldo.saldoFinal) < Number(formData.monto)) {
              // En modo creación, verificar que haya suficiente saldo para el monto completo
              newErrors.monto = `No hay suficiente saldo disponible. Saldo actual: L. ${flujoSaldo.saldoFinal}`;
            }
          }
        }
      } catch (error) {
        console.error('Error al verificar saldo disponible:', error);
      }
    }
    
    // Actualizar los errores y devolver si el formulario es válido
    if (Object.keys(newErrors).length > 0) {
      console.log('Errores de validación:', newErrors);
      setErrors(newErrors);
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mostrar el estado actual del formulario antes de validar
    console.log('[BalanceSaleForm] Estado del formulario antes de enviar:', formData);
    console.log('[BalanceSaleForm] Tipo de telefonicaId:', typeof formData.telefonicaId, formData.telefonicaId);
    console.log('[BalanceSaleForm] Tipo de flujoSaldoId:', typeof formData.flujoSaldoId, formData.flujoSaldoId);
    
    // Evitar envíos múltiples
    if (submitting) {
      console.log('[BalanceSaleForm] Formulario ya está siendo enviado, ignorando click');
      return;
    }
    
    const isValid = await validateForm();
    if (!isValid) {
      console.log('[BalanceSaleForm] Formulario inválido, abortando envío');
      return;
    }
    
    setSubmitting(true);
    console.log(`[BalanceSaleForm] Iniciando ${isEditMode ? 'actualización' : 'creación'} de venta de saldo`);
    
    try {
      // Funciones de utilidad para conversión segura de tipos
      const safeParseInt = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseInt(String(value).trim()) || 0;
      };
      
      const safeParseFloat = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseFloat(String(value).trim()) || 0;
      };
      
      // Crear una copia del objeto para no modificar el estado original
      const dataToSubmit = {
        // Forzar la conversión de todos los campos numéricos
        usuarioId: safeParseInt(authState.user?.id || 0),
        telefonicaId: safeParseInt(formData.telefonicaId),
        flujoSaldoId: safeParseInt(formData.flujoSaldoId),
        paqueteId: formData.paqueteId !== undefined ? safeParseInt(formData.paqueteId) : undefined,
        cantidad: safeParseInt(formData.cantidad),
        monto: safeParseFloat(formData.monto),
        // Mantener fecha como Date para cumplir con la interfaz BalanceSale
        fecha: formData.fecha instanceof Date ? formData.fecha : new Date(formData.fecha),
        observacion: formData.observacion || '',
        activo: Boolean(formData.activo)
      };
      
      console.log('[BalanceSaleForm] Datos convertidos a enviar:', dataToSubmit);
      
      if (isEditMode && id) {
        const result = await updateBalanceSale(parseInt(id), dataToSubmit);
        console.log('[BalanceSaleForm] Resultado de la actualización:', result);
        
        // Ya no actualizamos los saldos automáticamente después de editar una venta
        // Los saldos se actualizarán solo cuando el usuario presione el botón "Actualizar Flujos de Ventas"
      } else {
        // Crear la venta de saldo
        const result = await createBalanceSale(dataToSubmit);
        console.log('[BalanceSaleForm] Resultado de la creación:', result);
        
        // Ya no actualizamos los saldos automáticamente después de crear una venta
        // Los saldos se actualizarán solo cuando el usuario presione el botón "Actualizar Flujos de Ventas"
      }
      
      // Navegar a la lista de ventas de saldo
      console.log('[BalanceSaleForm] Operación exitosa, redirigiendo a la lista');
      navigate('/balance-sales');
    } catch (error: any) {
      console.error('[BalanceSaleForm] Error al guardar venta de saldo:', error);
      // Mostrar mensaje de error
      alert(`Error al ${isEditMode ? 'actualizar' : 'crear'} la venta de saldo: ${error.message || 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
      console.log(`[BalanceSaleForm] Finalizado ${isEditMode ? 'actualización' : 'creación'} de venta de saldo`);
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
                name="telefonicaId"
                value={formData.telefonicaId || ''}
                onChange={handleSelectChange}
                label="Línea Telefónica"
                disabled={submitting}
              >
                <MenuItem value="">Seleccione una línea</MenuItem>
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
                name="flujoSaldoId"
                value={formData.flujoSaldoId || ''}
                onChange={handleSelectChange}
                label="Flujo de Saldo"
                disabled={submitting}
              >
                <MenuItem value="">Seleccione un flujo</MenuItem>
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
            <FormControl fullWidth error={!!errors.paqueteId}>
              <InputLabel>Paquete</InputLabel>
              <Select
                name="paqueteId"
                value={formData.paqueteId !== undefined ? formData.paqueteId : ''}
                onChange={handleSelectChange}
                label="Paquete"
                disabled={submitting || formData.telefonicaId === 0}
                required
              >
                <MenuItem value="">Ninguno</MenuItem>
                {packages?.map((pkg: Package) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.nombre} (L. {pkg.precio})
                  </MenuItem>
                ))}
              </Select>
              {formData.telefonicaId === 0 ? (
                <FormHelperText>Seleccione primero una línea telefónica</FormHelperText>
              ) : packages.length === 0 ? (
                <FormHelperText>No hay paquetes disponibles para esta línea telefónica</FormHelperText>
              ) : (
                <FormHelperText>Mostrando {packages.length} paquetes para la línea seleccionada</FormHelperText>
              )}
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

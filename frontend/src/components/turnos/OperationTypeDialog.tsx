import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { 
  Store as StoreIcon, 
  Person as PersonIcon,
  CheckCircleOutline as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import turnosApi from '../../api/turnos/turnosApi';
import { useAuth } from '../../contexts/AuthContext';

export interface OperationType {
  agente: boolean;
  super: boolean;
  cajaNumero?: number;
}

interface OperationTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (operationType: OperationType) => void;
  turnoNombre: string;
}

const OperationTypeDialog: React.FC<OperationTypeDialogProps> = ({
  open,
  onClose,
  onConfirm,
  turnoNombre
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCaja, setSelectedCaja] = useState<number | null>(null);
  const [showCajaSelection, setShowCajaSelection] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  
  const { hasPermission, hasRole } = useAuth();

  // Obtener estado de operaciones en uso
  const { data: operacionesEnUso, isLoading: loadingOperaciones } = useQuery({
    queryKey: ['turnos', 'operaciones-en-uso'],
    queryFn: turnosApi.getOperacionesEnUso,
    enabled: open, // Solo consultar cuando el diálogo esté abierto
    refetchInterval: 5000, // Actualizar cada 5 segundos mientras esté abierto
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(event.target.value);
    setValidationError(''); // Limpiar error al cambiar selección
    setShowCajaSelection(false); // Reset selección de caja
    setSelectedCaja(null);
  };

  const handleCajaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCaja(Number(event.target.value));
    setValidationError('');
  };

  const handleNext = () => {
    if (!selectedType) return;
    
    // Si seleccionó Super, mostrar selección de caja
    if (selectedType === 'super') {
      setShowCajaSelection(true);
    } else {
      // Si seleccionó Agente, confirmar directamente
      handleConfirm();
    }
  };

  const handleBack = () => {
    setShowCajaSelection(false);
    setSelectedCaja(null);
    setValidationError('');
  };

  const handleConfirm = async () => {
    setIsValidating(true);
    setValidationError('');

    try {
      // Validar permisos para VendedorB
      if (hasRole('VendedorB')) {
        const tienePermisoAgentes = hasPermission('ver_menu_operacion_agente');
        const tienePermisoSuper = hasPermission('ver_menu_operacion_super');
        
        if (selectedType === 'agente' && !tienePermisoAgentes) {
          setValidationError('No tienes permisos para operar en la sección de Agentes.');
          setIsValidating(false);
          return;
        }
        
        if (selectedType === 'super' && !tienePermisoSuper) {
          setValidationError('No tienes permisos para operar en la sección de Super.');
          setIsValidating(false);
          return;
        }
      }

      // Obtener el estado más reciente de las operaciones
      const estadoOperaciones = await turnosApi.getOperacionesEnUso();
      
      // Validar si la operación seleccionada está disponible
      if (selectedType === 'agente' && estadoOperaciones.operacionAgente.enUso) {
        const nombreUsuario = estadoOperaciones.operacionAgente.usuario ? 
          `${estadoOperaciones.operacionAgente.usuario.nombre} ${estadoOperaciones.operacionAgente.usuario.apellido}` : 
          'Usuario desconocido';
        setValidationError(`La operación de Agentes ya está siendo utilizada por ${nombreUsuario}. Solo un usuario puede acceder a esta operación a la vez.`);
        setIsValidating(false);
        return;
      }

      if (selectedType === 'super') {
        // Validar que se haya seleccionado una caja
        if (!selectedCaja) {
          setValidationError('Debe seleccionar una caja para la operación de Super.');
          setIsValidating(false);
          return;
        }

        // Validar que la caja esté disponible
        const cajaInfo = estadoOperaciones.cajas?.find(c => c.id === selectedCaja);
        if (cajaInfo?.enUso) {
          const nombreUsuario = cajaInfo.usuario ? 
            `${cajaInfo.usuario.nombre} ${cajaInfo.usuario.apellido}` : 
            'Usuario desconocido';
          setValidationError(`La ${cajaInfo.nombre} ya está siendo utilizada por ${nombreUsuario}. Solo un usuario puede acceder a cada caja a la vez.`);
          setIsValidating(false);
          return;
        }
      }

      // Si llegamos aquí, la operación está disponible
      const operationType: OperationType = {
        agente: selectedType === 'agente',
        super: selectedType === 'super',
        cajaNumero: selectedType === 'super' ? selectedCaja! : undefined
      };
      
      onConfirm(operationType);
      setSelectedType(''); // Reset selection
      setSelectedCaja(null); // Reset caja
      setShowCajaSelection(false); // Reset vista
      setValidationError(''); // Reset error
    } catch (error: any) {
      console.error('Error al validar operación:', error);
      setValidationError('Error al validar la disponibilidad de la operación. Por favor, intente nuevamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setSelectedType(''); // Reset selection
    setSelectedCaja(null); // Reset caja
    setShowCajaSelection(false); // Reset vista
    setValidationError(''); // Reset error
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Box>
          <Typography variant="h6">
            {showCajaSelection ? 'Seleccionar Caja' : 'Seleccionar Tipo de Operación'}
          </Typography>
          <Typography variant="subtitle2">
            Turno: {turnoNombre}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1" paragraph>
          {showCajaSelection 
            ? 'Seleccione la caja que utilizará para la operación de Super:'
            : 'Seleccione el tipo de operación que realizará durante este turno:'}
        </Typography>

        {/* Mostrar error de validación */}
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Operación no disponible</AlertTitle>
            {validationError}
          </Alert>
        )}

        {/* Mostrar estado de carga */}
        {loadingOperaciones && (
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Verificando disponibilidad de operaciones...
            </Typography>
          </Box>
        )}
        
        {/* Vista de selecci\u00f3n de caja (Paso 2) */}
        {showCajaSelection ? (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              aria-label="caja-selection"
              name="caja-selection"
              value={selectedCaja?.toString() || ''}
              onChange={handleCajaChange}
            >
              {operacionesEnUso?.cajas?.map((caja) => (
                <Box 
                  key={caja.id}
                  sx={{ 
                    border: '1px solid', 
                    borderColor: caja.enUso ? 'error.main' : 
                               selectedCaja === caja.id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                    bgcolor: caja.enUso ? 'error.50' :
                            selectedCaja === caja.id ? 'primary.light' : 'background.paper',
                    opacity: caja.enUso ? 0.6 : 1,
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: caja.enUso ? 'error.main' : 'primary.main',
                      bgcolor: caja.enUso ? 'error.50' : 'primary.50'
                    }
                  }}
                >
                  <FormControlLabel 
                    value={caja.id.toString()}
                    control={<Radio disabled={caja.enUso} />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StoreIcon sx={{ 
                          mr: 1, 
                          color: caja.enUso ? 'error.main' : 'primary.main' 
                        }} />
                        <Typography variant="body1" fontWeight="bold">{caja.nombre}</Typography>
                        {selectedCaja === caja.id && !caja.enUso && (
                          <CheckIcon sx={{ ml: 1, color: 'success.main' }} />
                        )}
                        {caja.enUso && (
                          <ErrorIcon sx={{ ml: 1, color: 'error.main' }} />
                        )}
                      </Box>
                    }
                    sx={{ width: '100%' }}
                  />
                  {caja.enUso && caja.usuario && (
                    <Typography variant="body2" sx={{ ml: 4, mt: 1, color: 'error.main', fontWeight: 'bold' }}>
                      En uso por: {caja.usuario.nombre} {caja.usuario.apellido}
                    </Typography>
                  )}
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
        ) : (
          /* Vista de selecci\u00f3n de tipo de operaci\u00f3n (Paso 1) */
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              aria-label="operation-type"
              name="operation-type"
              value={selectedType}
              onChange={handleChange}
            >
            <Box 
              sx={{ 
                border: '1px solid', 
                borderColor: operacionesEnUso?.operacionAgente.enUso ? 'error.main' : 
                           !hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB') ? 'warning.main' :
                           selectedType === 'agente' ? 'primary.main' : 'divider',
                borderRadius: 1,
                p: 2,
                mb: 2,
                bgcolor: operacionesEnUso?.operacionAgente.enUso ? 'error.50' :
                        !hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB') ? 'warning.50' :
                        selectedType === 'agente' ? 'primary.light' : 'background.paper',
                opacity: (operacionesEnUso?.operacionAgente.enUso || (!hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB'))) ? 0.6 : 1,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: operacionesEnUso?.operacionAgente.enUso ? 'error.main' : 
                             !hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB') ? 'warning.main' : 'primary.main',
                  bgcolor: operacionesEnUso?.operacionAgente.enUso ? 'error.50' : 
                          !hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB') ? 'warning.50' : 'primary.50'
                }
              }}
            >
              <FormControlLabel 
                value="agente" 
                control={<Radio disabled={operacionesEnUso?.operacionAgente.enUso || (!hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB'))} />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ 
                      mr: 1, 
                      color: operacionesEnUso?.operacionAgente.enUso ? 'error.main' : 
                             !hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB') ? 'warning.main' : 'primary.main' 
                    }} />
                    <Typography variant="body1" fontWeight="bold">Operación de Agentes</Typography>
                    {selectedType === 'agente' && !operacionesEnUso?.operacionAgente.enUso && hasPermission('ver_menu_operacion_agente') && (
                      <CheckIcon sx={{ ml: 1, color: 'success.main' }} />
                    )}
                    {operacionesEnUso?.operacionAgente.enUso && (
                      <ErrorIcon sx={{ ml: 1, color: 'error.main' }} />
                    )}
                    {!hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB') && (
                      <WarningIcon sx={{ ml: 1, color: 'warning.main' }} />
                    )}
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              <Typography variant="body2" sx={{ ml: 4, mt: 1, color: 'text.secondary' }}>
                Acceso a funciones relacionadas con la gestión de agentes, transacciones y flujos de saldo.
              </Typography>
              {operacionesEnUso?.operacionAgente.enUso && (
                <Typography variant="body2" sx={{ ml: 4, mt: 1, color: 'error.main', fontWeight: 'bold' }}>
                  En uso por: {operacionesEnUso.operacionAgente.usuario ? 
                    `${operacionesEnUso.operacionAgente.usuario.nombre} ${operacionesEnUso.operacionAgente.usuario.apellido}` : 
                    'Usuario desconocido'
                  }
                </Typography>
              )}
              {!hasPermission('ver_menu_operacion_agente') && hasRole('VendedorB') && (
                <Typography variant="body2" sx={{ ml: 4, mt: 1, color: 'warning.main', fontWeight: 'bold' }}>
                  Sin permisos para esta operación
                </Typography>
              )}
            </Box>
            
            <Box 
              sx={{ 
                border: '1px solid', 
                borderColor: !hasPermission('ver_menu_operacion_super') && hasRole('VendedorB') ? 'warning.main' :
                           selectedType === 'super' ? 'primary.main' : 'divider',
                borderRadius: 1,
                p: 2,
                bgcolor: !hasPermission('ver_menu_operacion_super') && hasRole('VendedorB') ? 'warning.50' :
                        selectedType === 'super' ? 'primary.light' : 'background.paper',
                opacity: (!hasPermission('ver_menu_operacion_super') && hasRole('VendedorB')) ? 0.6 : 1,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: !hasPermission('ver_menu_operacion_super') && hasRole('VendedorB') ? 'warning.main' : 'primary.main',
                  bgcolor: !hasPermission('ver_menu_operacion_super') && hasRole('VendedorB') ? 'warning.50' : 'primary.50'
                }
              }}
            >
              <FormControlLabel 
                value="super" 
                control={<Radio disabled={!hasPermission('ver_menu_operacion_super') && hasRole('VendedorB')} />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StoreIcon sx={{ 
                      mr: 1, 
                      color: !hasPermission('ver_menu_operacion_super') && hasRole('VendedorB') ? 'warning.main' : 'primary.main' 
                    }} />
                    <Typography variant="body1" fontWeight="bold">Operación de Super</Typography>
                    {selectedType === 'super' && hasPermission('ver_menu_operacion_super') && (
                      <CheckIcon sx={{ ml: 1, color: 'success.main' }} />
                    )}
                    {!hasPermission('ver_menu_operacion_super') && hasRole('VendedorB') && (
                      <WarningIcon sx={{ ml: 1, color: 'warning.main' }} />
                    )}
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              <Typography variant="body2" sx={{ ml: 4, mt: 1, color: 'text.secondary' }}>
                Acceso a funciones relacionadas con la gestión del supermercado, ventas, inventario y caja. Seleccione una caja disponible en el siguiente paso.
              </Typography>
              {!hasPermission('ver_menu_operacion_super') && hasRole('VendedorB') && (
                <Typography variant="body2" sx={{ ml: 4, mt: 1, color: 'warning.main', fontWeight: 'bold' }}>
                  Sin permisos para esta operación
                </Typography>
              )}
            </Box>
          </RadioGroup>
        </FormControl>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          {showCajaSelection 
            ? 'Nota: La caja seleccionada será la que utilice durante todo el turno.'
            : 'Nota: Solo podrá acceder a las funciones del tipo de operación seleccionado durante este turno. Si necesita cambiar el tipo de operación, deberá finalizar el turno actual e iniciar uno nuevo.'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {showCajaSelection && (
          <Button onClick={handleBack} color="inherit">
            Atrás
          </Button>
        )}
        <Button onClick={handleCancel} color="inherit">
          Cancelar
        </Button>
        {showCajaSelection ? (
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            color="primary"
            disabled={!selectedCaja || isValidating}
            startIcon={isValidating ? <CircularProgress size={16} /> : undefined}
          >
            {isValidating ? 'Validando...' : 'Confirmar e Iniciar Turno'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            variant="contained" 
            color="primary"
            disabled={!selectedType}
          >
            {selectedType === 'super' ? 'Siguiente' : 'Confirmar e Iniciar Turno'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OperationTypeDialog;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import providersApi from '../../api/providers/providersApi';
import transactionTypesApi from '../../api/transaction-types/transactionTypesApi';
import formulaConfigsApi, { BulkUpdateConfigDto } from '../../api/formula-configs/formulaConfigsApi';

const FormulaConfigForm: React.FC = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Estado para almacenar las configuraciones de fórmulas
  const [configs, setConfigs] = useState<BulkUpdateConfigDto[]>([]);
  
  // Consulta para obtener el proveedor
  const { data: provider, isLoading: isLoadingProvider } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => providersApi.getById(Number(providerId)),
    enabled: !!providerId,
  });
  
  // Consulta para obtener los tipos de transacciones
  const { data: transactionTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['transactionTypes'],
    queryFn: () => transactionTypesApi.getAll(),
  });
  
  // Consulta para obtener las configuraciones existentes
  const { data: existingConfigs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['formulaConfigs', providerId],
    queryFn: () => formulaConfigsApi.getByProvider(Number(providerId)),
    enabled: !!providerId,
  });
  
  // Mutación para guardar las configuraciones
  const saveConfigsMutation = useMutation({
    mutationFn: (configs: BulkUpdateConfigDto[]) => {
      console.log('Enviando configuraciones al backend:', configs);
      return formulaConfigsApi.bulkUpdateForProvider(Number(providerId), configs);
    },
    onSuccess: (data) => {
      console.log('Configuraciones guardadas exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['formulaConfigs'] });
      navigate(`/providers`);
    },
    onError: (error) => {
      console.error('Error al guardar las configuraciones:', error);
      alert('Error al guardar las configuraciones. Revisa la consola para más detalles.');
    }
  });
  
  // Inicializar las configuraciones cuando se cargan los tipos de transacciones y las configuraciones existentes
  useEffect(() => {
    if (transactionTypes.length > 0 && !isLoadingConfigs) {
      const initialConfigs = transactionTypes.map(type => {
        // Buscar si ya existe una configuración para este tipo
        const existingConfig = existingConfigs.find(
          config => config.tipoTransaccionId === type.id
        );
        
        return {
          tipoTransaccionId: type.id,
          incluirEnCalculo: existingConfig ? existingConfig.incluirEnCalculo : false,
          factorMultiplicador: existingConfig ? existingConfig.factorMultiplicador : 1,
          sumaTotal: existingConfig ? existingConfig.sumaTotal : false,
        };
      });
      
      setConfigs(initialConfigs);
    }
  }, [transactionTypes, existingConfigs, isLoadingConfigs]);
  
  // Manejar cambios en el switch de incluir en cálculo
  const handleIncluirChange = (tipoTransaccionId: number, checked: boolean) => {
    setConfigs(prevConfigs => 
      prevConfigs.map(config => 
        config.tipoTransaccionId === tipoTransaccionId
          ? { ...config, incluirEnCalculo: checked }
          : config
      )
    );
  };
  
  // Manejar cambios en el factor multiplicador
  const handleFactorChange = (tipoTransaccionId: number, factor: number) => {
    setConfigs(prevConfigs => 
      prevConfigs.map(config => 
        config.tipoTransaccionId === tipoTransaccionId
          ? { ...config, factorMultiplicador: factor }
          : config
      )
    );
  };
  
  // Manejar cambios en el switch de suma total
  const handleSumaTotalChange = (tipoTransaccionId: number, checked: boolean) => {
    console.log(`Cambiando sumaTotal para tipo ${tipoTransaccionId} a ${checked}`);
    setConfigs(prevConfigs => {
      const newConfigs = prevConfigs.map(config => 
        config.tipoTransaccionId === tipoTransaccionId
          ? { ...config, sumaTotal: checked }
          : config
      );
      console.log('Nuevo estado de configs después de cambiar sumaTotal:', newConfigs);
      return newConfigs;
    });
  };
  
  // Guardar las configuraciones
  const handleSave = () => {
    console.log('Guardando configuraciones:', configs);
    saveConfigsMutation.mutate(configs);
  };
  
  // Si está cargando, mostrar indicador de carga
  if (isLoadingProvider || isLoadingTypes || isLoadingConfigs) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="formula-icon" style={{ fontSize: '1.2em' }}>⚙️</span>
          Configuración para {provider?.nombre}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/providers')}
        >
          Volver
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Seleccione los tipos de transacciones que desea incluir en el cálculo del Resultado Final para este agente. 
            Para cada tipo, puede definir un factor multiplicador (1 para sumar, -1 para restar).
            La opción "Suma Total" permite determinar si se sumarán todas las transacciones de ese tipo sin importar a qué agente pertenecen.
          </Typography>
        </Alert>
        
        <TableContainer>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Tipo de Transacción</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Incluir en Cálculo</TableCell>
                <TableCell align="center">Factor Multiplicador</TableCell>
                <TableCell align="center">Suma Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => {
                const transactionType = transactionTypes.find(
                  type => type.id === config.tipoTransaccionId
                );
                
                return (
                  <TableRow key={config.tipoTransaccionId}>
                    <TableCell>{transactionType?.nombre}</TableCell>
                    <TableCell>{transactionType?.descripcion || 'Sin descripción'}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={config.incluirEnCalculo}
                        onChange={(e) => handleIncluirChange(config.tipoTransaccionId, e.target.checked)}
                        color="primary"
                        size="small"
                        sx={{ p: 0 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={config.factorMultiplicador}
                          onChange={(e) => handleFactorChange(config.tipoTransaccionId, Number(e.target.value))}
                          disabled={!config.incluirEnCalculo}
                        >
                          <MenuItem value={1}>Sumar (+)</MenuItem>
                          <MenuItem value={-1}>Restar (-)</MenuItem>
                        </Select>
                      </FormControl>
                      <Tooltip title="Este factor determina si el valor de la transacción se suma o resta en el cálculo del Resultado Final">
                        <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                          <InfoIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={config.sumaTotal}
                        onChange={(e) => handleSumaTotalChange(config.tipoTransaccionId, e.target.checked)}
                        color="secondary"
                        disabled={!config.incluirEnCalculo}
                        size="small"
                        sx={{ p: 0 }}
                      />
                      <Tooltip title="Si está activado, se sumarán todas las transacciones de este tipo sin importar a qué agente pertenecen, y con ese valor total se realizará el cálculo del Resultado Final">
                        <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                          <InfoIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={saveConfigsMutation.isLoading ? <CircularProgress size={24} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saveConfigsMutation.isLoading}
          >
            Guardar Configuración
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FormulaConfigForm;

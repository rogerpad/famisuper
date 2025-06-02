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
    mutationFn: (configs: BulkUpdateConfigDto[]) => 
      formulaConfigsApi.bulkUpdateForProvider(Number(providerId), configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulaConfigs'] });
      navigate(`/providers`);
    },
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
  
  // Guardar las configuraciones
  const handleSave = () => {
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
          </Typography>
        </Alert>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo de Transacción</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Incluir en Cálculo</TableCell>
                <TableCell align="center">Factor Multiplicador</TableCell>
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
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoIcon fontSize="small" />
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

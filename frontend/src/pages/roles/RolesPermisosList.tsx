import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import rolesApi, { Role } from '../../api/roles/rolesApi';
import permisosApi, { Permiso } from '../../api/permisos/permisosApi';

// Interfaz para agrupar permisos por módulo
interface PermisosAgrupados {
  [modulo: string]: Permiso[];
}

const RolesPermisosList: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermisos, setSelectedPermisos] = useState<number[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  // Obtener todos los roles
  const {
    data: roles,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
  });

  // Obtener todos los permisos
  const {
    data: permisos,
    isLoading: isLoadingPermisos,
    error: permisosError,
  } = useQuery({
    queryKey: ['permisos'],
    queryFn: permisosApi.getAll,
  });

  // Obtener permisos del rol seleccionado
  const {
    data: permisosRol,
    isLoading: isLoadingPermisosRol,
    refetch: refetchPermisosRol,
  } = useQuery({
    queryKey: ['permisos', 'rol', selectedRoleId],
    queryFn: () => (selectedRoleId ? permisosApi.getByRol(selectedRoleId) : Promise.resolve([])),
    enabled: selectedRoleId !== null,
    onSuccess: (data) => {
      // Actualizar los permisos seleccionados cuando se cargan los permisos del rol
      setSelectedPermisos(data.map((p) => p.id));
    },
  });

  // Mutación para asignar permisos a un rol
  const asignarPermisosMutation = useMutation({
    mutationFn: (data: { rolId: number; permisosIds: number[] }) =>
      permisosApi.asignarPermisos(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos', 'rol', selectedRoleId] });
      setOpenDialog(false);
    },
  });

  // Agrupar permisos por módulo
  const permisosAgrupados: PermisosAgrupados = React.useMemo(() => {
    if (!permisos) return {};
    
    return permisos.reduce((acc: PermisosAgrupados, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {});
  }, [permisos]);

  // Manejar cambio de rol seleccionado
  const handleRoleChange = (roleId: number) => {
    setSelectedRoleId(roleId);
  };

  // Manejar cambio de permiso
  const handlePermisoChange = (permisoId: number) => {
    setSelectedPermisos((prev) => {
      if (prev.includes(permisoId)) {
        return prev.filter((id) => id !== permisoId);
      } else {
        return [...prev, permisoId];
      }
    });
  };

  // Manejar cambio de todos los permisos de un módulo
  const handleModuloChange = (moduloPermisos: Permiso[]) => {
    const moduloPermisosIds = moduloPermisos.map((p) => p.id);
    const allSelected = moduloPermisosIds.every((id) => selectedPermisos.includes(id));
    
    if (allSelected) {
      // Deseleccionar todos los permisos del módulo
      setSelectedPermisos((prev) => prev.filter((id) => !moduloPermisosIds.includes(id)));
    } else {
      // Seleccionar todos los permisos del módulo
      const newSelectedPermisos = [...selectedPermisos];
      moduloPermisosIds.forEach((id) => {
        if (!newSelectedPermisos.includes(id)) {
          newSelectedPermisos.push(id);
        }
      });
      setSelectedPermisos(newSelectedPermisos);
    }
  };

  // Guardar permisos
  const handleSavePermisos = () => {
    if (selectedRoleId) {
      setOpenDialog(true);
    }
  };

  // Confirmar asignación de permisos
  const handleConfirmAsignar = () => {
    if (selectedRoleId) {
      const payload = {
        rolId: Number(selectedRoleId), // Asegurar que rolId sea un número
        permisosIds: selectedPermisos.map(id => Number(id)), // Asegurar que todos los IDs sean números
      };
      console.log('Enviando datos al backend:', payload);
      asignarPermisosMutation.mutate(payload);
    }
  };

  // Cerrar diálogo de confirmación
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Mostrar cargando si se están cargando los datos
  if (isLoadingRoles || isLoadingPermisos) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: '#dc7633' }} />
      </Box>
    );
  }

  // Mostrar error si hay algún problema al cargar los datos
  if (rolesError || permisosError) {
    return (
      <Box m={2}>
        <Alert severity="error">
          Error al cargar los datos. Por favor, intente nuevamente.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ color: '#dc7633', fontWeight: 'bold' }}>
        Gestión de Permisos por Rol
      </Typography>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Seleccione un Rol
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={selectedRoleId || false}
            onChange={(_, value) => handleRoleChange(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .Mui-selected': {
                color: '#dc7633 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#dc7633',
              },
            }}
          >
            {roles?.map((role) => (
              <Tab
                key={role.id}
                label={role.nombre}
                value={role.id}
                disabled={!role.activo}
                icon={role.activo ? undefined : <Chip size="small" label="Inactivo" color="default" />}
                iconPosition="end"
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {selectedRoleId ? (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Permisos para: {roles?.find((r) => r.id === selectedRoleId)?.nombre}
            </Typography>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSavePermisos}
              disabled={isLoadingPermisosRol || asignarPermisosMutation.isLoading}
              sx={{
                bgcolor: '#dc7633',
                '&:hover': {
                  bgcolor: '#c56a2d',
                },
              }}
            >
              {asignarPermisosMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>

          {isLoadingPermisosRol ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress size={40} sx={{ color: '#dc7633' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {Object.entries(permisosAgrupados).map(([modulo, moduloPermisos]) => {
                const allModuloSelected = moduloPermisos.every((p) =>
                  selectedPermisos.includes(p.id)
                );
                const someModuloSelected = moduloPermisos.some((p) =>
                  selectedPermisos.includes(p.id)
                );

                return (
                  <Grid item xs={12} md={6} key={modulo}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box display="flex" alignItems="center">
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={allModuloSelected}
                                  indeterminate={!allModuloSelected && someModuloSelected}
                                  onChange={() => handleModuloChange(moduloPermisos)}
                                  sx={{
                                    '&.Mui-checked': {
                                      color: '#dc7633',
                                    },
                                    '&.MuiCheckbox-indeterminate': {
                                      color: '#dc7633',
                                    },
                                  }}
                                />
                              }
                              label={<Typography variant="h6">{modulo}</Typography>}
                            />
                          </Box>
                        }
                        sx={{ backgroundColor: '#f9f9f9' }}
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={1}>
                          {moduloPermisos.map((permiso) => (
                            <Grid item xs={12} key={permiso.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedPermisos.includes(permiso.id)}
                                    onChange={() => handlePermisoChange(permiso.id)}
                                    sx={{
                                      '&.Mui-checked': {
                                        color: '#dc7633',
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body1">{permiso.nombre}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {permiso.descripcion}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          Seleccione un rol para gestionar sus permisos
        </Alert>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar cambios</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea guardar los cambios en los permisos para el rol{' '}
            <strong>{roles?.find((r) => r.id === selectedRoleId)?.nombre}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAsignar}
            variant="contained"
            sx={{
              bgcolor: '#dc7633',
              '&:hover': {
                bgcolor: '#c56a2d',
              },
            }}
            disabled={asignarPermisosMutation.isLoading}
          >
            {asignarPermisosMutation.isLoading ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesPermisosList;

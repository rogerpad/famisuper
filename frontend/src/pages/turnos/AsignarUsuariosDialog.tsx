import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Chip,
} from '@mui/material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import turnosApi, { Turno } from '../../api/turnos/turnosApi';
import usersApi from '../../api/users/usersApi';
import { toValidId, isValidId } from '../../utils/validationUtils';

interface AsignarUsuariosDialogProps {
  open: boolean;
  onClose: () => void;
  turno: Turno | null;
}

const AsignarUsuariosDialog: React.FC<AsignarUsuariosDialogProps> = ({ open, onClose, turno }) => {
  const [selectedUsuarios, setSelectedUsuarios] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Consulta para obtener los usuarios
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  // Deduplicate users by ID to prevent duplicate keys
  const users = React.useMemo(() => {
    if (!usersData) return [];
    
    // Use Map to ensure unique IDs more efficiently
    const uniqueUsersMap = new Map();
    usersData.forEach(user => {
      if (user && user.id !== undefined && user.id !== null) {
        uniqueUsersMap.set(user.id, user);
      }
    });
    
    const uniqueUsers = Array.from(uniqueUsersMap.values());
    console.log('[ASIGNAR USUARIOS] Datos originales:', usersData.length);
    console.log('[ASIGNAR USUARIOS] Usuarios únicos después de deduplicación:', uniqueUsers.length);
    console.log('[ASIGNAR USUARIOS] IDs únicos:', uniqueUsers.map(u => u.id));
    console.log('[ASIGNAR USUARIOS] Usuarios completos:', uniqueUsers.map(u => ({ id: u.id, nombre: u.nombre, apellido: u.apellido, username: u.username })));
    
    return uniqueUsers;
  }, [usersData]);

  // Cargar los usuarios ya asignados cuando se abre el diálogo
  useEffect(() => {
    if (open && turno && turno.usuarios) {
      // Validar cada ID de usuario antes de agregarlo al array
      const validUserIds = turno.usuarios
        .map(u => toValidId(u.id))
        .filter((id): id is number => id !== undefined);
      
      // Deduplicate selected user IDs as well
      const uniqueValidUserIds = Array.from(new Set(validUserIds));
      
      console.log('[ASIGNAR USUARIOS] IDs de usuarios cargados:', validUserIds);
      console.log('[ASIGNAR USUARIOS] IDs únicos seleccionados:', uniqueValidUserIds);
      setSelectedUsuarios(uniqueValidUserIds);
    } else {
      setSelectedUsuarios([]);
    }
  }, [open, turno]);

  // Mutación para asignar usuarios
  const asignarUsuariosMutation = useMutation({
    mutationFn: ({ turnoId, usuariosIds }: { turnoId: number | string; usuariosIds: (number | string)[] }) => {
      // Validar el ID del turno
      const validTurnoId = toValidId(turnoId);
      if (validTurnoId === undefined) {
        console.error(`[ASIGNAR USUARIOS] ID de turno inválido: ${turnoId}`);
        throw new Error(`ID de turno inválido: ${turnoId}`);
      }
      
      // Validar los IDs de usuarios
      const validUsuariosIds = usuariosIds
        .map(id => toValidId(id))
        .filter((id): id is number => id !== undefined);
      
      console.log(`[ASIGNAR USUARIOS] Asignando ${validUsuariosIds.length} usuarios al turno ${validTurnoId}`);
      return turnosApi.asignarUsuarios(validTurnoId, validUsuariosIds);
    },
    onSuccess: () => {
      console.log('[ASIGNAR USUARIOS] Usuarios asignados correctamente');
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('[ASIGNAR USUARIOS] Error al asignar usuarios:', error.message || error);
      setError(error.message || 'Error al asignar usuarios al turno');
    }
  });

  const handleChange = (event: any) => {
    const value = event.target.value;
    console.log('[HANDLE CHANGE] Raw value received:', value, 'Type:', typeof value);
    
    // Material UI sends the actual selected values, not what was clicked
    // So we need to directly use what Material UI gives us
    let selectedIds: number[] = [];
    
    if (Array.isArray(value)) {
      // Count occurrences to detect if user is trying to remove
      const counts = new Map<number, number>();
      value.forEach(id => {
        const numId = Number(id);
        if (!isNaN(numId)) {
          counts.set(numId, (counts.get(numId) || 0) + 1);
        }
      });
      
      // If a value appears more than once, user is trying to remove it
      // Keep only values that appear exactly once
      selectedIds = Array.from(counts.entries())
        .filter(([_, count]) => count === 1)
        .map(([id, _]) => id);
    }
    
    console.log('[HANDLE CHANGE] IDs procesados:', selectedIds);
    console.log('[HANDLE CHANGE] Estado anterior:', selectedUsuarios);
    console.log('[HANDLE CHANGE] Nuevo estado:', selectedIds);
    
    setSelectedUsuarios(selectedIds);
  };

  const handleSubmit = () => {
    if (turno && isValidId(turno.id)) {
      console.log(`[ASIGNAR USUARIOS] Enviando asignación para turno ${turno.id} con ${selectedUsuarios.length} usuarios`);
      asignarUsuariosMutation.mutate({
        turnoId: turno.id,
        usuariosIds: selectedUsuarios
      });
    } else if (turno) {
      console.error(`[ASIGNAR USUARIOS] Intento de asignar usuarios a turno con ID inválido: ${turno.id}`);
      setError(`ID de turno inválido: ${turno.id}`);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!turno) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Asignar Usuarios al Turno: {turno.nombre}
      </DialogTitle>
      <DialogContent>
        {isLoadingUsers ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Seleccione los usuarios que desea asignar a este turno. Los usuarios asignados podrán iniciar y finalizar este turno si tienen los permisos correspondientes.
              </Typography>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="usuarios-multiple-checkbox-label">Usuarios</InputLabel>
              <Select
                labelId="usuarios-multiple-checkbox-label"
                id="usuarios-multiple-checkbox"
                multiple
                value={selectedUsuarios}
                onChange={handleChange}
                input={<OutlinedInput label="Usuarios" />}
                renderValue={(selected) => {
                  console.log('[RENDER VALUE] Selected values:', selected);
                  console.log('[RENDER VALUE] Available users:', users?.map(u => ({ id: u.id, nombre: u.nombre, apellido: u.apellido })));
                  
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        // Convert both to numbers for comparison
                        const user = users?.find(u => Number(u.id) === Number(value));
                        console.log(`[RENDER VALUE] ID: ${value} (${typeof value}), User found:`, user);
                        
                        let displayName = `Usuario ${value}`;
                        if (user) {
                          console.log(`[RENDER VALUE] User object keys:`, Object.keys(user));
                          console.log(`[RENDER VALUE] User object:`, user);
                          
                          // Try different possible field names
                          const firstName = user.nombre || user.name || user.first_name || '';
                          const lastName = user.apellido || user.lastname || user.last_name || '';
                          const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`.trim();
                          
                          displayName = fullName || user.username || `Usuario ${value}`;
                          console.log(`[RENDER VALUE] Display name for ${value}:`, displayName);
                        }
                        
                        return (
                          <Chip 
                            key={value} 
                            label={displayName}
                            size="small"
                            onDelete={() => {
                              const newSelected = selectedUsuarios.filter(id => Number(id) !== Number(value));
                              console.log(`[CHIP DELETE] Eliminando usuario ${value} (${typeof value})`);
                              console.log(`[CHIP DELETE] Estado anterior:`, selectedUsuarios);
                              console.log(`[CHIP DELETE] Nuevo estado:`, newSelected);
                              setSelectedUsuarios(newSelected);
                            }}
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 500,
                              '& .MuiChip-deleteIcon': {
                                color: '#1976d2',
                                '&:hover': {
                                  color: '#d32f2f'
                                }
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {users?.map((user) => {
                  // Convert both to numbers for consistent comparison
                  const isChecked = selectedUsuarios.some(selectedId => Number(selectedId) === Number(user.id));
                  console.log(`[CHECKBOX] User ${user.id} (${user.nombre}), Selected IDs:`, selectedUsuarios, 'Is checked:', isChecked);
                  
                  return (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox checked={isChecked} />
                      <ListItemText 
                        primary={`${user.nombre} ${user.apellido || ''}`} 
                        secondary={user.username} 
                      />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{ bgcolor: '#dc7633', '&:hover': { bgcolor: '#c56a2d' }, color: 'white' }}
          disabled={asignarUsuariosMutation.isLoading}
        >
          {asignarUsuariosMutation.isLoading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Asignando...
            </>
          ) : (
            'Asignar Usuarios'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsignarUsuariosDialog;

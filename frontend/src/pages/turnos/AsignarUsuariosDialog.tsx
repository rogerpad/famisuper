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
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  // Cargar los usuarios ya asignados cuando se abre el diálogo
  useEffect(() => {
    if (open && turno && turno.usuarios) {
      setSelectedUsuarios(turno.usuarios.map(u => u.id));
    } else {
      setSelectedUsuarios([]);
    }
  }, [open, turno]);

  // Mutación para asignar usuarios
  const asignarUsuariosMutation = useMutation({
    mutationFn: ({ turnoId, usuariosIds }: { turnoId: number; usuariosIds: number[] }) => 
      turnosApi.asignarUsuarios(turnoId, usuariosIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error al asignar usuarios:', error);
      setError(error.message || 'Error al asignar usuarios al turno');
    }
  });

  const handleChange = (event: any) => {
    const value = event.target.value;
    setSelectedUsuarios(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  const handleSubmit = () => {
    if (turno) {
      asignarUsuariosMutation.mutate({
        turnoId: turno.id,
        usuariosIds: selectedUsuarios
      });
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
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const user = users?.find(u => u.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={user ? `${user.nombre} ${user.apellido || ''}` : `Usuario ${value}`} 
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {users?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={selectedUsuarios.indexOf(user.id) > -1} />
                    <ListItemText 
                      primary={`${user.nombre} ${user.apellido || ''}`} 
                      secondary={user.username} 
                    />
                  </MenuItem>
                ))}
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

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usePhoneLines } from '../../api/phoneLines/phoneLinesApi';
import PhoneLinesForm from './PhoneLinesForm';
import { PhoneLine } from '../../types/phoneLines';

const PhoneLinesList: React.FC = () => {
  const {
    phoneLines,
    loading,
    error,
    fetchPhoneLines,
    deletePhoneLine,
  } = usePhoneLines();

  const [openForm, setOpenForm] = useState(false);
  const [editingPhoneLine, setEditingPhoneLine] = useState<PhoneLine | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [phoneLineToDelete, setPhoneLineToDelete] = useState<PhoneLine | null>(null);

  useEffect(() => {
    fetchPhoneLines();
  }, [fetchPhoneLines]);

  const handleAddClick = () => {
    setEditingPhoneLine(null);
    setOpenForm(true);
  };

  const handleEditClick = (phoneLine: PhoneLine) => {
    setEditingPhoneLine(phoneLine);
    setOpenForm(true);
  };

  const handleDeleteClick = (phoneLine: PhoneLine) => {
    setPhoneLineToDelete(phoneLine);
    setOpenDeleteDialog(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingPhoneLine(null);
    fetchPhoneLines(); // Refrescar la lista después de cerrar el formulario
  };

  const handleConfirmDelete = async () => {
    if (phoneLineToDelete) {
      await deletePhoneLine(phoneLineToDelete.id);
      setOpenDeleteDialog(false);
      setPhoneLineToDelete(null);
      fetchPhoneLines(); // Refrescar la lista después de eliminar
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setPhoneLineToDelete(null);
  };

  if (loading && phoneLines.length === 0) {
    return <Typography>Cargando líneas telefónicas...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          Líneas Telefónicas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nueva Línea
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {phoneLines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay líneas telefónicas registradas
                </TableCell>
              </TableRow>
            ) : (
              phoneLines.map((phoneLine) => (
                <TableRow key={phoneLine.id}>
                  <TableCell>{phoneLine.id}</TableCell>
                  <TableCell>{phoneLine.nombre}</TableCell>
                  <TableCell>{phoneLine.descripcion}</TableCell>
                  <TableCell>
                    <Chip
                      label={phoneLine.activo ? 'Activo' : 'Inactivo'}
                      color={phoneLine.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(phoneLine)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(phoneLine)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario de creación/edición */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPhoneLine ? 'Editar Línea Telefónica' : 'Nueva Línea Telefónica'}
        </DialogTitle>
        <DialogContent>
          <PhoneLinesForm
            phoneLine={editingPhoneLine}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la línea telefónica "{phoneLineToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhoneLinesList;

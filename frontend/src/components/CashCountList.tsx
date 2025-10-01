import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import es from 'date-fns/locale/es';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import cashApi, { Billete } from '../api/cash/cashApi';
import usersApi, { User } from '../api/users/usersApi';
import { format } from 'date-fns';
import CashCounter from './CashCounter';
import { useAuth } from '../contexts/AuthContext';
import { isValidId, toValidId } from '../utils/validationUtils';

// Interfaz para los filtros
interface Filters {
  startDate: Date | null;
  endDate: Date | null;
  usuarioId: string;
}

// Interfaz para los datos agrupados por conteo
interface GroupedCashCount {
  id: number;
  fecha: string;
  usuarioId: number;
  usuarioNombre?: string;
  total: number;
  billetes: Billete[];
}

// Interfaz para los datos del conteo de efectivo a enviar a la API
interface CashCountUpdateData {
  usuarioId: number;
  totalGeneral: number;
  estado: boolean;
  turnoId?: number; // Opcional pero debe ser número si está presente
  // Denominaciones con tipos estrictos para evitar errores de TypeScript
  deno500: number;
  cant500: number;
  total500: number;
  deno200: number;
  cant200: number;
  total200: number;
  deno100: number;
  cant100: number;
  total100: number;
  deno50: number;
  cant50: number;
  total50: number;
  deno20: number;
  cant20: number;
  total20: number;
  deno10: number;
  cant10: number;
  total10: number;
  deno5: number;
  cant5: number;
  total5: number;
  deno2: number;
  cant2: number;
  total2: number;
  deno1: number;
  cant1: number;
  total1: number;
}

const CashCountList: React.FC = () => {
  // Estado para los conteos de efectivo
  const [cashCounts, setCashCounts] = useState<GroupedCashCount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para los filtros
  const [filters, setFilters] = useState<Filters>({
    startDate: null,
    endDate: null,
    usuarioId: '',
  });
  
  // Estado para los diálogos
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [selectedCount, setSelectedCount] = useState<GroupedCashCount | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  
  // Estado para almacenar los usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  
  // Obtener el contexto de autenticación
  const { state: authState } = useAuth();
  
  // Cargar los usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Cargar los conteos cuando los usuarios estén disponibles
  useEffect(() => {
    if (users.length > 0) {
      loadCashCounts();
    }
  }, [users]);
  
  // Función para cargar los usuarios
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await usersApi.getAll();
      console.log('[CASH_COUNT_LIST] Usuarios cargados:', usersData.length);
      if (usersData.length > 0) {
        setUsers(usersData);
      } else {
        console.warn('[CASH_COUNT_LIST] No se encontraron usuarios');
        // Si no hay usuarios, cargar los conteos de todas formas
        loadCashCounts();
      }
    } catch (error) {
      console.error('[CASH_COUNT_LIST] Error al cargar usuarios:', error);
      // En caso de error, cargar los conteos de todas formas
      loadCashCounts();
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Función para cargar los conteos de efectivo
  const loadCashCounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allBilletes = await cashApi.getAllBilletes();
      
      if (!allBilletes || allBilletes.length === 0) {
        setCashCounts([]);
        return;
      }
      
      // Filtrar solo billetes activos
      const billetes = allBilletes.filter(billete => Boolean(billete.estado));
      
      // Agrupar billetes por conteo (mismo ID y fecha)
      const groupedCounts: { [key: string]: GroupedCashCount } = {};
      
      billetes.forEach(billete => {
        // Crear una clave única para cada conteo
        const countKey = `${billete.id}-${billete.fecha}`;
        
        if (!groupedCounts[countKey]) {
          // Buscar el nombre del usuario si tenemos usuarios cargados
          const usuario = users.find(user => user.id === billete.usuarioId);
          let usuarioNombre = undefined;
          
          if (usuario) {
            usuarioNombre = `${usuario.nombre} ${usuario.apellido || ''}`.trim();
            console.log(`[CASH_COUNT_LIST] Usuario encontrado para ID ${billete.usuarioId}: ${usuarioNombre}`);
          } else {
            console.log(`[CASH_COUNT_LIST] No se encontró usuario para ID ${billete.usuarioId}`);
          }
          
          groupedCounts[countKey] = {
            id: billete.id,
            fecha: billete.fecha instanceof Date ? billete.fecha.toISOString() : new Date(billete.fecha).toISOString(),
            usuarioId: billete.usuarioId,
            usuarioNombre: usuarioNombre,
            total: billete.totalGeneral || 0,
            billetes: []
          };
        }
        
        groupedCounts[countKey].billetes.push(billete);
      });
      
      // Convertir el objeto agrupado a un array y ordenar por fecha (más reciente primero)
      const groupedArray = Object.values(groupedCounts).sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      
      setCashCounts(groupedArray);
    } catch (error) {
      console.error('[CASH_COUNT_LIST] Error al cargar los conteos:', error);
      setError('Error al cargar los conteos de efectivo');
    } finally {
      setLoading(false);
    }
  };
  
  // Aplicar filtros a los conteos
  const filteredCashCounts = cashCounts.filter(cashCount => {
    const countDate = new Date(cashCount.fecha);
    
    // Filtrar por fecha de inicio
    if (filters.startDate && countDate < filters.startDate) {
      return false;
    }
    
    // Filtrar por fecha de fin
    if (filters.endDate) {
      const endDateWithTime = new Date(filters.endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (countDate > endDateWithTime) {
        return false;
      }
    }
    
    // Filtrar por ID de usuario
    if (filters.usuarioId && filters.usuarioId.trim() !== '') {
      const usuarioIdStr = String(cashCount.usuarioId);
      if (usuarioIdStr !== filters.usuarioId.trim()) {
        return false;
      }
    }
    
    return true;
  });
  
  // Los conteos ya están filtrados arriba
  
  // Función para mostrar los detalles de un conteo
  const handleViewDetails = (cashCount: GroupedCashCount) => {
    setSelectedCount(cashCount);
    setDetailsOpen(true);
  };
  
  // Función para abrir el diálogo de edición
  const handleEdit = (count: GroupedCashCount) => {
    setSelectedCount(count);
    setEditOpen(true);
  };

  // Función para abrir el diálogo de confirmación de eliminación
  const handleDeleteConfirm = (count: GroupedCashCount) => {
    console.log(`[CASH_COUNT_LIST] Solicitando confirmación para eliminar conteo ID: ${count.id}`);
    setSelectedCount(count);
    setDeleteConfirmOpen(true);
  };

  // Función para manejar la eliminación de un conteo
  const handleDelete = async () => {
    if (!selectedCount) {
      console.error('[CASH_COUNT_LIST] No hay conteo seleccionado para eliminar');
      setSnackbarMessage('Error: No hay conteo seleccionado para eliminar');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`[CASH_COUNT_LIST] Eliminando conteo con ID: ${selectedCount.id}`);
      
      await cashApi.deleteCashCount(selectedCount.id);
      
      // Cerrar el diálogo de confirmación
      setDeleteConfirmOpen(false);
      
      // Mostrar mensaje de éxito
      setSnackbarMessage(`Conteo #${selectedCount.id} eliminado correctamente`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Recargar la lista de conteos
      loadCashCounts();
    } catch (error: any) {
      console.error(`[CASH_COUNT_LIST] Error al eliminar conteo con ID ${selectedCount.id}:`, error);
      
      // Mostrar mensaje de error
      setSnackbarMessage(`Error al eliminar conteo: ${error.message || 'Error desconocido'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Función para manejar la actualización de un conteo de efectivo
  const handleEditSave = async (data: { denominations: { value: number; label: string; quantity: number; total: number }[]; total: number }) => {
    try {
      console.log('[CASH_COUNT_LIST] Datos recibidos del componente CashCounter:', data);
      
      if (!selectedCount) {
        console.error('[CASH_COUNT_LIST] No hay conteo seleccionado para editar');
        setSnackbarMessage('Error: No hay conteo seleccionado para editar');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Validar que el total sea un número válido
      if (data.total === undefined || data.total === null || isNaN(Number(data.total))) {
        console.error(`[CASH_COUNT_LIST] Total inválido: ${data.total}`);
        setSnackbarMessage('Error: El total del conteo es inválido');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Validar que el usuario esté autenticado
      if (!authState.user?.id || authState.user.id === undefined || authState.user.id === null || !isValidId(authState.user.id)) {
        console.error(`[CASH_COUNT_LIST] ID de usuario inválido: ${authState.user?.id}`);
        setSnackbarMessage('Error de autenticación: Usuario inválido');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Convertir explícitamente el ID de usuario a número para evitar problemas de tipo
      // toValidId ahora siempre devuelve un número válido
      const userId = toValidId(Number(authState.user.id));
      
      // Crear objeto con la estructura esperada por la API
      const cashCountData: CashCountUpdateData = {
        usuarioId: userId, // userId es un número garantizado
        totalGeneral: Number(data.total),
        estado: true,
        // Inicializar todas las denominaciones con valores por defecto
        deno500: 0,
        cant500: 0,
        total500: 0,
        deno200: 0,
        cant200: 0,
        total200: 0,
        deno100: 0,
        cant100: 0,
        total100: 0,
        deno50: 0,
        cant50: 0,
        total50: 0,
        deno20: 0,
        cant20: 0,
        total20: 0,
        deno10: 0,
        cant10: 0,
        total10: 0,
        deno5: 0,
        cant5: 0,
        total5: 0,
        deno2: 0,
        cant2: 0,
        total2: 0,
        deno1: 0,
        cant1: 0,
        total1: 0
      };
      
      // Mapear las denominaciones al formato esperado por la API
      data.denominations.forEach(denom => {
        const value = Number(denom.value);
        const count = Number(denom.quantity);
        const total = Number(denom.total);
        
        switch (value) {
          case 500:
            cashCountData.deno500 = value;
            cashCountData.cant500 = count;
            cashCountData.total500 = total;
            break;
          case 200:
            cashCountData.deno200 = value;
            cashCountData.cant200 = count;
            cashCountData.total200 = total;
            break;
          case 100:
            cashCountData.deno100 = value;
            cashCountData.cant100 = count;
            cashCountData.total100 = total;
            break;
          case 50:
            cashCountData.deno50 = value;
            cashCountData.cant50 = count;
            cashCountData.total50 = total;
            break;
          case 20:
            cashCountData.deno20 = value;
            cashCountData.cant20 = count;
            cashCountData.total20 = total;
            break;
          case 10:
            cashCountData.deno10 = value;
            cashCountData.cant10 = count;
            cashCountData.total10 = total;
            break;
          case 5:
            cashCountData.deno5 = value;
            cashCountData.cant5 = count;
            cashCountData.total5 = total;
            break;
          case 2:
            cashCountData.deno2 = value;
            cashCountData.cant2 = count;
            cashCountData.total2 = total;
            break;
          case 1:
            cashCountData.deno1 = value;
            cashCountData.cant1 = count;
            cashCountData.total1 = total;
            break;
        }
      });
      
      // Asegurarnos de preservar el turnoId SOLO si existe y es válido
      const originalTurnoId = selectedCount.billetes[0]?.turnoId;
      if (originalTurnoId !== undefined && originalTurnoId !== null && isValidId(originalTurnoId)) {
        // Convertir explícitamente a número para evitar problemas de tipo
        const validTurnoId = toValidId(Number(originalTurnoId));
        cashCountData.turnoId = validTurnoId;
        console.log(`[CASH_COUNT_LIST] Preservando turnoId: ${cashCountData.turnoId}`);
      } else {
        console.warn(`[CASH_COUNT_LIST] No se encontró un turnoId válido en el conteo original: ${originalTurnoId}`);
        // NO asignar el campo turnoId en absoluto para evitar el error "property turnoId should not exist"
        // Eliminamos explícitamente la propiedad si existe
        delete cashCountData.turnoId;
      }
      
      console.log('[CASH_COUNT_LIST] Datos a enviar para actualizar:', cashCountData);
      
      // Validar que el ID del conteo sea válido
      if (selectedCount.id === undefined || selectedCount.id === null || !isValidId(selectedCount.id)) {
        const errorMsg = `ID de conteo inválido: ${selectedCount.id}`;
        console.error(`[CASH_COUNT_LIST] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      // Convertir explícitamente a número para evitar problemas de tipo
      // Usamos Number() para asegurar que es un número antes de pasarlo a toValidId
      const countId = Number(selectedCount.id);
      // toValidId ahora siempre devuelve un número válido
      const validCountId = toValidId(countId);
      console.log(`[CASH_COUNT_LIST] ID de conteo validado: ${validCountId}`);
      
      // Llamar a la API para actualizar
      await cashApi.updateCashCount(validCountId, cashCountData);
      
      // Cerrar el diálogo y recargar los datos
      setEditOpen(false);
      loadCashCounts();
      
      // Mostrar mensaje de éxito
      setSnackbarMessage('Conteo de efectivo actualizado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('[CASH_COUNT_LIST] Error al actualizar conteo:', error);
      
      // Mostrar mensaje de error detallado
      let errorMessage = 'Error al actualizar conteo de efectivo';
      
      // Manejar errores específicos relacionados con la validación
      if (error.message) {
        if (error.message.includes('ID de usuario inválido')) {
          errorMessage = 'Error de autenticación: Usuario inválido';
          console.error('[CASH_COUNT_LIST] Error de autenticación:', error.message);
        } else if (error.message.includes('Total general')) {
          errorMessage = 'Error en el total: Valor inválido';
          console.error('[CASH_COUNT_LIST] Error en el total:', error.message);
        } else if (error.message.includes('ID de turno inválido')) {
          errorMessage = 'Error en el turno: ID inválido';
          console.error('[CASH_COUNT_LIST] Error en el turno:', error.message);
        } else if (error.message.includes('ID de conteo inválido')) {
          errorMessage = 'Error en el conteo: ID inválido';
          console.error('[CASH_COUNT_LIST] Error en el ID de conteo:', error.message);
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      // Manejar errores de la API
      if (error.response) {
        console.error(`[CASH_COUNT_LIST] Error de API: Status ${error.response.status}`);
        
        if (error.response.status === 400) {
          errorMessage = 'Datos inválidos en el conteo de efectivo';
        } else if (error.response.status === 401) {
          errorMessage = 'Sesión expirada, por favor inicie sesión nuevamente';
        } else if (error.response.status === 404) {
          errorMessage = 'No se encontró el conteo de efectivo para actualizar';
        } else if (error.response.status === 500) {
          errorMessage = 'Error interno del servidor';
        }
        
        if (error.response?.data?.message) {
          errorMessage = `${errorMessage} - ${error.response.data.message}`;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsEditing(false);
    }
  };
  
  // Función para imprimir un conteo específico
  const handlePrint = (cashCount: GroupedCashCount) => {
    try {
      // Crear una nueva ventana para imprimir
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Por favor, permita las ventanas emergentes para imprimir');
        return;
      }
      
      // Función para generar filas de denominaciones
      const generateDenominationRows = (billete: Billete) => {
        const rows: string[] = [];
        
        if (billete.deno500 && billete.cant500) {
          rows.push(`
            <tr>
              <td>500</td>
              <td style="text-align: right;">${billete.cant500}</td>
              <td style="text-align: right;">L ${Number(billete.total500).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno200 && billete.cant200) {
          rows.push(`
            <tr>
              <td>200</td>
              <td style="text-align: right;">${billete.cant200}</td>
              <td style="text-align: right;">L ${Number(billete.total200).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno100 && billete.cant100) {
          rows.push(`
            <tr>
              <td>100</td>
              <td style="text-align: right;">${billete.cant100}</td>
              <td style="text-align: right;">L ${Number(billete.total100).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno50 && billete.cant50) {
          rows.push(`
            <tr>
              <td>50</td>
              <td style="text-align: right;">${billete.cant50}</td>
              <td style="text-align: right;">L ${Number(billete.total50).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno20 && billete.cant20) {
          rows.push(`
            <tr>
              <td>20</td>
              <td style="text-align: right;">${billete.cant20}</td>
              <td style="text-align: right;">L ${Number(billete.total20).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno10 && billete.cant10) {
          rows.push(`
            <tr>
              <td>10</td>
              <td style="text-align: right;">${billete.cant10}</td>
              <td style="text-align: right;">L ${Number(billete.total10).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno5 && billete.cant5) {
          rows.push(`
            <tr>
              <td>5</td>
              <td style="text-align: right;">${billete.cant5}</td>
              <td style="text-align: right;">L ${Number(billete.total5).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno2 && billete.cant2) {
          rows.push(`
            <tr>
              <td>2</td>
              <td style="text-align: right;">${billete.cant2}</td>
              <td style="text-align: right;">L ${Number(billete.total2).toFixed(2)}</td>
            </tr>
          `);
        }
        
        if (billete.deno1 && billete.cant1) {
          rows.push(`
            <tr>
              <td>1</td>
              <td style="text-align: right;">${billete.cant1}</td>
              <td style="text-align: right;">L ${Number(billete.total1).toFixed(2)}</td>
            </tr>
          `);
        }
        
        return rows.join('');
      };
      
      // Crear el contenido HTML para imprimir
      const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conteo de Efectivo #${cashCount.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { font-size: 18px; text-align: center; }
            .info { margin-bottom: 20px; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Conteo de Efectivo #${cashCount.id}</h1>
          
          <div class="info">
            <p><strong>Fecha:</strong> ${format(new Date(cashCount.fecha), 'dd/MM/yyyy HH:mm')}</p>
            <p><strong>Usuario:</strong> ${cashCount.usuarioNombre ? cashCount.usuarioNombre : `ID: ${cashCount.usuarioId}`}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Denominación</th>
                <th style="text-align: right;">Cantidad</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cashCount.billetes.map(billete => generateDenominationRows(billete)).join('')}
              <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total General</td>
                <td style="text-align: right;">L ${Number(cashCount.total).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </body>
        </html>
      `;
      
      // Escribir el contenido en la nueva ventana
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Esperar a que el contenido se cargue antes de imprimir
      printWindow.onload = () => {
        printWindow.print();
        // No cerramos la ventana para permitir al usuario guardar como PDF si lo desea
      };
    } catch (error) {
      console.error('[CASH_COUNT_LIST] Error al imprimir:', error);
      alert('Error al generar la impresión');
    }
  }; 
  
  // Función para exportar a CSV
  const handleExportCSV = () => {
    try {
      // Crear el contenido del CSV
      let csvContent = 'ID,Fecha,Usuario,Total\n';
      
      // Agregar los datos de cada conteo
      filteredCashCounts.forEach(cashCount => {
        csvContent += `${cashCount.id},${format(new Date(cashCount.fecha), 'dd/MM/yyyy HH:mm')},${cashCount.usuarioId},${Number(cashCount.total).toFixed(2)}\n`;
        
        // Agregar detalles de cada denominación
        cashCount.billetes.forEach(billete => {
          // Agregar cada denominación presente
          if (billete.deno500 && billete.cant500) {
            csvContent += `,,500,${billete.cant500},${Number(billete.total500).toFixed(2)}\n`;
          }
          
          if (billete.deno200 && billete.cant200) {
            csvContent += `,,200,${billete.cant200},${Number(billete.total200).toFixed(2)}\n`;
          }
          
          if (billete.deno100 && billete.cant100) {
            csvContent += `,,100,${billete.cant100},${Number(billete.total100).toFixed(2)}\n`;
          }
          
          if (billete.deno50 && billete.cant50) {
            csvContent += `,,50,${billete.cant50},${Number(billete.total50).toFixed(2)}\n`;
          }
          
          if (billete.deno20 && billete.cant20) {
            csvContent += `,,20,${billete.cant20},${Number(billete.total20).toFixed(2)}\n`;
          }
          
          if (billete.deno10 && billete.cant10) {
            csvContent += `,,10,${billete.cant10},${Number(billete.total10).toFixed(2)}\n`;
          }
          
          if (billete.deno5 && billete.cant5) {
            csvContent += `,,5,${billete.cant5},${Number(billete.total5).toFixed(2)}\n`;
          }
          
          if (billete.deno2 && billete.cant2) {
            csvContent += `,,2,${billete.cant2},${Number(billete.total2).toFixed(2)}\n`;
          }
          
          if (billete.deno1 && billete.cant1) {
            csvContent += `,,1,${billete.cant1},${Number(billete.total1).toFixed(2)}\n`;
          }
        });
        
        // Agregar una línea en blanco entre conteos
        csvContent += '\n';
      });
      
      // Crear un blob con el contenido CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Crear un enlace para descargar el archivo
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `conteos_efectivo_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('[CASH_COUNT_LIST] Error al exportar CSV:', error);
      alert('Error al exportar los datos a CSV');
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Historial de Conteos de Efectivo
      </Typography>
      
      {/* Filtros */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label="Fecha inicio"
            value={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date })}
            slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
          />
          <DatePicker
            label="Fecha fin"
            value={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date })}
            slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
          />
        </LocalizationProvider>
        
        <TextField
          label="ID Usuario"
          value={filters.usuarioId}
          onChange={(e) => setFilters({ ...filters, usuarioId: e.target.value })}
          size="small"
          sx={{ width: 120 }}
        />
        
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setFilters({ startDate: null, endDate: null, usuarioId: '' })}
          size="small"
        >
          Limpiar
        </Button>
        
        <Tooltip title="Recargar datos">
          <IconButton 
            color="primary" 
            onClick={loadCashCounts}
            disabled={loading}
          >
            <RefreshIcon />
            {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Tabla de conteos */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : filteredCashCounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay conteos que coincidan con los filtros aplicados
                </TableCell>
              </TableRow>
            ) : (
              filteredCashCounts.map((cashCount) => (
                <TableRow key={`${cashCount.id}-${cashCount.fecha}`}>
                  <TableCell>{cashCount.id}</TableCell>
                  <TableCell>{format(new Date(cashCount.fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {cashCount.usuarioNombre ? cashCount.usuarioNombre : `ID: ${cashCount.usuarioId}`}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`L ${Number(cashCount.total).toFixed(2)}`}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => handleViewDetails(cashCount)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(cashCount)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleDeleteConfirm(cashCount)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Diálogo para mostrar detalles */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles del Conteo #{selectedCount?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedCount && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  <strong>Fecha:</strong> {format(new Date(selectedCount.fecha), 'dd/MM/yyyy HH:mm')}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Usuario:</strong> {selectedCount.usuarioNombre ? selectedCount.usuarioNombre : `ID: ${selectedCount.usuarioId}`}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Total:</strong> L {Number(selectedCount.total).toFixed(2)}
                </Typography>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Denominación</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCount.billetes.map((billete, index) => {
                      // Crear filas para cada denominación presente en el billete
                      const rows = [];
                      
                      if (billete.deno500 && billete.cant500) {
                        rows.push(
                          <TableRow key={`${index}-500`}>
                            <TableCell>500</TableCell>
                            <TableCell align="right">{billete.cant500}</TableCell>
                            <TableCell align="right">L {Number(billete.total500).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno200 && billete.cant200) {
                        rows.push(
                          <TableRow key={`${index}-200`}>
                            <TableCell>200</TableCell>
                            <TableCell align="right">{billete.cant200}</TableCell>
                            <TableCell align="right">L {Number(billete.total200).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno100 && billete.cant100) {
                        rows.push(
                          <TableRow key={`${index}-100`}>
                            <TableCell>100</TableCell>
                            <TableCell align="right">{billete.cant100}</TableCell>
                            <TableCell align="right">L {Number(billete.total100).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno50 && billete.cant50) {
                        rows.push(
                          <TableRow key={`${index}-50`}>
                            <TableCell>50</TableCell>
                            <TableCell align="right">{billete.cant50}</TableCell>
                            <TableCell align="right">L {Number(billete.total50).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno20 && billete.cant20) {
                        rows.push(
                          <TableRow key={`${index}-20`}>
                            <TableCell>20</TableCell>
                            <TableCell align="right">{billete.cant20}</TableCell>
                            <TableCell align="right">L {Number(billete.total20).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno10 && billete.cant10) {
                        rows.push(
                          <TableRow key={`${index}-10`}>
                            <TableCell>10</TableCell>
                            <TableCell align="right">{billete.cant10}</TableCell>
                            <TableCell align="right">L {Number(billete.total10).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno5 && billete.cant5) {
                        rows.push(
                          <TableRow key={`${index}-5`}>
                            <TableCell>5</TableCell>
                            <TableCell align="right">{billete.cant5}</TableCell>
                            <TableCell align="right">L {Number(billete.total5).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno2 && billete.cant2) {
                        rows.push(
                          <TableRow key={`${index}-2`}>
                            <TableCell>2</TableCell>
                            <TableCell align="right">{billete.cant2}</TableCell>
                            <TableCell align="right">L {Number(billete.total2).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      if (billete.deno1 && billete.cant1) {
                        rows.push(
                          <TableRow key={`${index}-1`}>
                            <TableCell>1</TableCell>
                            <TableCell align="right">{billete.cant1}</TableCell>
                            <TableCell align="right">L {Number(billete.total1).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      }
                      
                      return rows.length > 0 ? rows : (
                        <TableRow key={index}>
                          <TableCell colSpan={3} align="center">No hay detalles disponibles</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={2} align="right"><strong>Total General</strong></TableCell>
                      <TableCell align="right"><strong>${Number(selectedCount.total).toFixed(2)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
          {selectedCount && (
            <Button 
              onClick={() => handlePrint(selectedCount)} 
              startIcon={<PrintIcon />}
              variant="contained"
            >
              Imprimir
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar conteo */}
      <Dialog
        open={editOpen}
        onClose={() => {
          if (!isEditing) {
            setEditOpen(false);
            setSelectedCount(null);
          }
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Editar Conteo de Efectivo
        </DialogTitle>
        <DialogContent>
          {selectedCount && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Fecha: {format(new Date(selectedCount.fecha), 'dd/MM/yyyy HH:mm')}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                ID: {selectedCount.id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Usuario: {selectedCount.usuarioNombre ? selectedCount.usuarioNombre : `ID: ${selectedCount.usuarioId}`}
              </Typography>
              
              {/* Componente CashCounter en modo edición */}
              <CashCounter 
                key={`edit-${selectedCount.id}`}
                initialData={{
                  // Convertir el formato de datos del backend al formato que espera CashCounter
                  denominations: [
                    // Extraer los datos del primer billete del conteo seleccionado
                    // ya que todos los billetes del mismo conteo tienen los mismos valores
                    { value: 500, label: '500', quantity: selectedCount.billetes[0]?.cant500 || 0, total: selectedCount.billetes[0]?.total500 || 0 },
                    { value: 200, label: '200', quantity: selectedCount.billetes[0]?.cant200 || 0, total: selectedCount.billetes[0]?.total200 || 0 },
                    { value: 100, label: '100', quantity: selectedCount.billetes[0]?.cant100 || 0, total: selectedCount.billetes[0]?.total100 || 0 },
                    { value: 50, label: '50', quantity: selectedCount.billetes[0]?.cant50 || 0, total: selectedCount.billetes[0]?.total50 || 0 },
                    { value: 20, label: '20', quantity: selectedCount.billetes[0]?.cant20 || 0, total: selectedCount.billetes[0]?.total20 || 0 },
                    { value: 10, label: '10', quantity: selectedCount.billetes[0]?.cant10 || 0, total: selectedCount.billetes[0]?.total10 || 0 },
                    { value: 5, label: '5', quantity: selectedCount.billetes[0]?.cant5 || 0, total: selectedCount.billetes[0]?.total5 || 0 },
                    { value: 2, label: '2', quantity: selectedCount.billetes[0]?.cant2 || 0, total: selectedCount.billetes[0]?.total2 || 0 },
                    { value: 1, label: '1', quantity: selectedCount.billetes[0]?.cant1 || 0, total: selectedCount.billetes[0]?.total1 || 0 },
                  ],
                  totalCash: selectedCount.total,
                  id: selectedCount.id,
                  turnoId: selectedCount.billetes[0]?.turnoId || undefined
                }}
                onSave={handleEditSave}
                isEditMode={true}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditOpen(false);
              setSelectedCount(null);
            }}
            disabled={isEditing}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar conteo */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSelectedCount(null);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar el conteo #{selectedCount?.id}?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteConfirmOpen(false);
              setSelectedCount(null);
            }}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mostrar mensajes de éxito o error */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CashCountList;

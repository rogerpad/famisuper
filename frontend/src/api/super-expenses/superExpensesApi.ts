import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../api';
import { CreateSuperExpenseDto, SuperExpense, SuperExpenseFilters, UpdateSuperExpenseDto } from './types';
import axios from 'axios';

// Constante para determinar si se usa mock data o API real
const USE_MOCK = false;

// Mock data para desarrollo
const mockSuperExpenses: SuperExpense[] = [];

export const useSuperExpenses = () => {
  const [superExpenses, setSuperExpenses] = useState<SuperExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuperExpenses = useCallback(async (showInactive: boolean = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        setSuperExpenses(mockSuperExpenses);
      } else {
        const response = await axios.get(`${API_BASE_URL}/super-expenses?showInactive=${showInactive}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuperExpenses(response.data);
      }
    } catch (err) {
      console.error('Error al obtener los egresos de super:', err);
      setError('Error al cargar los egresos de super');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuperExpensesByDateRange = useCallback(async (filters: SuperExpenseFilters) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        setSuperExpenses(mockSuperExpenses);
      } else {
        const { startDate, endDate, showInactive = false } = filters;
        let url = `${API_BASE_URL}/super-expenses`;
        
        if (startDate && endDate) {
          url = `${API_BASE_URL}/super-expenses/filter/by-date-range?startDate=${startDate}&endDate=${endDate}`;
        }
        
        if (showInactive) {
          url += url.includes('?') ? `&showInactive=${showInactive}` : `?showInactive=${showInactive}`;
        }
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuperExpenses(response.data);
      }
    } catch (err) {
      console.error('Error al obtener los egresos de super por rango de fechas:', err);
      setError('Error al cargar los egresos de super');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuperExpenseById = useCallback(async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      if (USE_MOCK) {
        return mockSuperExpenses.find(expense => expense.id === id) || null;
      } else {
        const response = await axios.get(`${API_BASE_URL}/super-expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Procesar los datos para asegurar que los IDs sean números
        const data = response.data;
        
        // Convertir explícitamente los IDs a números
        if (data) {
          console.log('Datos originales del egreso:', JSON.stringify(data));
          
          // Asegurar que los IDs sean números
          data.tipoEgresoId = data.tipoEgresoId !== null && data.tipoEgresoId !== undefined ? Number(data.tipoEgresoId) : null;
          data.formaPagoId = data.formaPagoId !== null && data.formaPagoId !== undefined ? Number(data.formaPagoId) : null;
          data.documentoPagoId = data.documentoPagoId !== null && data.documentoPagoId !== undefined ? Number(data.documentoPagoId) : null;
          
          // Convertir otros campos numéricos
          data.excento = data.excento !== null && data.excento !== undefined ? Number(data.excento) : 0;
          data.gravado = data.gravado !== null && data.gravado !== undefined ? Number(data.gravado) : 0;
          data.impuesto = data.impuesto !== null && data.impuesto !== undefined ? Number(data.impuesto) : 0;
          data.total = data.total !== null && data.total !== undefined ? Number(data.total) : 0;
          
          console.log('Datos procesados del egreso:', JSON.stringify(data));
        }
        
        return data;
      }
    } catch (err) {
      console.error(`Error al obtener el egreso de super con ID ${id}:`, err);
      return null;
    }
  }, []);

  const createSuperExpense = useCallback(async (data: CreateSuperExpenseDto) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        const newExpense: SuperExpense = {
          id: Math.floor(Math.random() * 1000),
          usuarioId: 1,
          tipoEgresoId: data.tipoEgresoId,
          descripcionEgreso: data.descripcionEgreso || '',
          documentoPagoId: data.documentoPagoId || 0,
          nroFactura: data.nroFactura || '',
          excento: data.excento || 0,
          gravado: data.gravado || 0,
          impuesto: data.impuesto || 0,
          total: data.total,
          formaPagoId: data.formaPagoId,
          fechaEgreso: data.fechaEgreso,
          hora: data.hora,
          activo: true
        };
        mockSuperExpenses.push(newExpense);
        setSuperExpenses([...mockSuperExpenses]);
        return newExpense;
      } else {
        console.log('Enviando datos al backend:', JSON.stringify(data));
        try {
          const response = await axios.post(`${API_BASE_URL}/super-expenses`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Respuesta del backend:', response.data);
          setSuperExpenses(prev => [...prev, response.data]);
          return response.data;
        } catch (axiosError: any) {
          console.error('Error de Axios:', axiosError);
          if (axiosError.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.error('Datos de respuesta de error:', axiosError.response.data);
            console.error('Estado HTTP:', axiosError.response.status);
            console.error('Cabeceras:', axiosError.response.headers);
            
            // Extraer mensaje de error si existe
            const errorMessage = axiosError.response.data?.message || 
                              axiosError.response.data?.error || 
                              `Error ${axiosError.response.status}: ${axiosError.response.statusText}`;
            
            throw new Error(errorMessage);
          } else if (axiosError.request) {
            // La solicitud se realizó pero no se recibió respuesta
            console.error('No se recibió respuesta del servidor:', axiosError.request);
            throw new Error('No se recibió respuesta del servidor. Verifique la conexión.');
          } else {
            // Algo sucedió en la configuración de la solicitud que desencadenó un error
            console.error('Error de configuración de la solicitud:', axiosError.message);
            throw new Error(`Error al configurar la solicitud: ${axiosError.message}`);
          }
        }
      }
    } catch (err: any) {
      console.error('Error al crear el egreso de super:', err);
      const errorMessage = err.message || 'Error desconocido al crear el egreso de super';
      setError(errorMessage);
      throw err; // Re-lanzar el error para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSuperExpense = useCallback(async (id: number, data: UpdateSuperExpenseDto) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Crear una copia limpia de los datos para procesar
      const cleanData = { ...data };
      
      // Convertir explícitamente los IDs a números
      if (cleanData.tipoEgresoId !== undefined) {
        cleanData.tipoEgresoId = Number(cleanData.tipoEgresoId);
      }
      
      if (cleanData.formaPagoId !== undefined) {
        cleanData.formaPagoId = Number(cleanData.formaPagoId);
      }
      
      // Manejar documentoPagoId especialmente
      if (cleanData.documentoPagoId !== undefined) {
        if (cleanData.documentoPagoId === null || String(cleanData.documentoPagoId) === '') {
          // Si es null o cadena vacía, eliminarlo para que el backend lo maneje como undefined
          delete cleanData.documentoPagoId;
        } else {
          // Si tiene un valor, convertirlo a número
          cleanData.documentoPagoId = Number(cleanData.documentoPagoId);
        }
      }
      
      // Manejar nroFactura
      if (cleanData.nroFactura !== undefined) {
        if (cleanData.nroFactura === '') {
          // Si es una cadena vacía, eliminarlo para que el backend lo maneje como undefined
          delete cleanData.nroFactura;
        }
      }
      
      // Convertir otros campos numéricos
      if (cleanData.excento !== undefined) cleanData.excento = Number(cleanData.excento);
      if (cleanData.gravado !== undefined) cleanData.gravado = Number(cleanData.gravado);
      if (cleanData.impuesto !== undefined) cleanData.impuesto = Number(cleanData.impuesto);
      if (cleanData.total !== undefined) cleanData.total = Number(cleanData.total);
      
      // Depuración: Mostrar datos que se envían al backend
      console.log('Datos originales para actualización:', JSON.stringify(data));
      console.log('Datos procesados para actualización:', JSON.stringify(cleanData));
      
      if (USE_MOCK) {
        const index = mockSuperExpenses.findIndex(expense => expense.id === id);
        if (index !== -1) {
          mockSuperExpenses[index] = { ...mockSuperExpenses[index], ...cleanData };
          setSuperExpenses([...mockSuperExpenses]);
          return mockSuperExpenses[index];
        }
        return null;
      } else {
        // Asegurarse de que el campo hora esté presente
        if (!cleanData.hora) {
          // Buscar el egreso actual para obtener la hora
          const currentExpense = superExpenses.find(expense => expense.id === id);
          if (currentExpense && currentExpense.hora) {
            cleanData.hora = currentExpense.hora;
            console.log('Añadiendo hora del registro actual:', cleanData.hora);
          }
        }
        
        console.log('Datos finales enviados al backend:', JSON.stringify(cleanData));
        
        const response = await axios.patch(`${API_BASE_URL}/super-expenses/${id}`, cleanData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Procesar la respuesta para asegurar que los IDs sean números
        const processedResponse = { ...response.data };
        if (processedResponse) {
          processedResponse.tipoEgresoId = processedResponse.tipoEgresoId !== null ? Number(processedResponse.tipoEgresoId) : null;
          processedResponse.formaPagoId = processedResponse.formaPagoId !== null ? Number(processedResponse.formaPagoId) : null;
          processedResponse.documentoPagoId = processedResponse.documentoPagoId !== null ? Number(processedResponse.documentoPagoId) : null;
        }
        
        setSuperExpenses(prev => 
          prev.map(expense => expense.id === id ? { ...expense, ...processedResponse } : expense)
        );
        return processedResponse;
      }
    } catch (err: any) {
      console.error(`Error al actualizar el egreso de super con ID ${id}:`, err);
      
      // Mostrar más detalles del error si están disponibles
      if (err.response) {
        console.error('Respuesta de error del servidor:', err.response.data);
        console.error('Estado HTTP:', err.response.status);
        console.error('Cabeceras:', err.response.headers);
      }
      
      setError('Error al actualizar el egreso de super');
      return null;
    } finally {
      setLoading(false);
    }
  }, [superExpenses]);

  const toggleSuperExpenseActive = useCallback(async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      if (USE_MOCK) {
        const index = mockSuperExpenses.findIndex(expense => expense.id === id);
        if (index !== -1) {
          mockSuperExpenses[index].activo = !mockSuperExpenses[index].activo;
          setSuperExpenses([...mockSuperExpenses]);
          return mockSuperExpenses[index];
        }
        return null;
      } else {
        const response = await axios.patch(`${API_BASE_URL}/super-expenses/${id}/toggle-active`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuperExpenses(prev => 
          prev.map(expense => expense.id === id ? { ...expense, activo: response.data.activo } : expense)
        );
        return response.data;
      }
    } catch (err) {
      console.error(`Error al cambiar el estado del egreso de super con ID ${id}:`, err);
      return null;
    }
  }, []);

  const deleteSuperExpense = useCallback(async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      if (USE_MOCK) {
        const index = mockSuperExpenses.findIndex(expense => expense.id === id);
        if (index !== -1) {
          mockSuperExpenses.splice(index, 1);
          setSuperExpenses([...mockSuperExpenses]);
          return true;
        }
        return false;
      } else {
        await axios.delete(`${API_BASE_URL}/super-expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuperExpenses(prev => prev.filter(expense => expense.id !== id));
        return true;
      }
    } catch (err) {
      console.error(`Error al eliminar el egreso de super con ID ${id}:`, err);
      return false;
    }
  }, []);

  // Usar un useEffect sin dependencia a fetchSuperExpenses para evitar ciclos infinitos
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Llamada inicial a fetchSuperExpenses
      fetchSuperExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSumPagoProductosEfectivo = useCallback(async (): Promise<number> => {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    
    try {
      if (USE_MOCK) {
        // Valor de prueba para desarrollo
        return 15000;
      } else {
        const response = await axios.get(`${API_BASE_URL}/super-expenses/sum/pago-productos-efectivo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.suma || 0;
      }
    } catch (err) {
      console.error('Error al obtener la suma de pagos de productos en efectivo:', err);
      return 0;
    }
  }, []);

  const getSumGastosEfectivo = useCallback(async (): Promise<number> => {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    
    try {
      if (USE_MOCK) {
        // Valor de prueba para desarrollo
        return 5000;
      } else {
        const response = await axios.get(`${API_BASE_URL}/super-expenses/sum/gastos-efectivo`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.suma || 0;
      }
    } catch (err) {
      console.error('Error al obtener la suma de gastos en efectivo:', err);
      return 0;
    }
  }, []);

  return {
    superExpenses,
    loading,
    error,
    fetchSuperExpenses,
    fetchSuperExpensesByDateRange,
    getSuperExpenseById,
    createSuperExpense,
    updateSuperExpense,
    toggleSuperExpenseActive,
    deleteSuperExpense,
    getSumPagoProductosEfectivo,
    getSumGastosEfectivo
  };
};

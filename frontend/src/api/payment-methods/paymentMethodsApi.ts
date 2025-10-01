import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto } from './types';

// Constante para determinar si se usa mock data o API real
const USE_MOCK = false;

// Mock data para desarrollo
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    nombre: 'Efectivo',
    descripcion: 'Pago en efectivo',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Tarjeta de crédito',
    descripcion: 'Pago con tarjeta de crédito',
    activo: true,
  },
];

// Hook personalizado para gestionar formas de pago
export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener todas las formas de pago
  const fetchPaymentMethods = useCallback(async (onlyActive: boolean = false) => {
    if (USE_MOCK) {
      setPaymentMethods(mockPaymentMethods);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/payment-methods`, {
        params: { onlyActive },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPaymentMethods(response.data);
    } catch (err) {
      setError('Error al cargar las formas de pago');
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener una forma de pago por ID
  const getPaymentMethodById = useCallback(async (id: number) => {
    if (USE_MOCK) {
      return mockPaymentMethods.find(pm => pm.id === id) || null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/payment-methods/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    } catch (err) {
      setError(`Error al cargar la forma de pago con ID ${id}`);
      console.error('Error fetching payment method by ID:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para crear una nueva forma de pago
  const createPaymentMethod = useCallback(async (data: CreatePaymentMethodDto) => {
    if (USE_MOCK) {
      const newPaymentMethod: PaymentMethod = {
        id: mockPaymentMethods.length + 1,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        activo: data.activo !== undefined ? data.activo : true,
      };
      mockPaymentMethods.push(newPaymentMethod);
      setPaymentMethods([...mockPaymentMethods]);
      return newPaymentMethod;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/payment-methods`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchPaymentMethods();
      return response.data;
    } catch (err) {
      setError('Error al crear la forma de pago');
      console.error('Error creating payment method:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  // Función para actualizar una forma de pago existente
  const updatePaymentMethod = useCallback(async (id: number, data: UpdatePaymentMethodDto) => {
    if (USE_MOCK) {
      const index = mockPaymentMethods.findIndex(pm => pm.id === id);
      if (index !== -1) {
        mockPaymentMethods[index] = {
          ...mockPaymentMethods[index],
          ...data,
        };
        setPaymentMethods([...mockPaymentMethods]);
        return mockPaymentMethods[index];
      }
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(`${API_BASE_URL}/payment-methods/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchPaymentMethods();
      return response.data;
    } catch (err) {
      setError(`Error al actualizar la forma de pago con ID ${id}`);
      console.error('Error updating payment method:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  // Función para eliminar una forma de pago
  const deletePaymentMethod = useCallback(async (id: number) => {
    if (USE_MOCK) {
      const index = mockPaymentMethods.findIndex(pm => pm.id === id);
      if (index !== -1) {
        mockPaymentMethods.splice(index, 1);
        setPaymentMethods([...mockPaymentMethods]);
        return true;
      }
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/payment-methods/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchPaymentMethods();
      return true;
    } catch (err) {
      setError(`Error al eliminar la forma de pago con ID ${id}`);
      console.error('Error deleting payment method:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  // Función para activar/desactivar una forma de pago
  const togglePaymentMethodActive = useCallback(async (id: number) => {
    if (USE_MOCK) {
      const index = mockPaymentMethods.findIndex(pm => pm.id === id);
      if (index !== -1) {
        mockPaymentMethods[index].activo = !mockPaymentMethods[index].activo;
        setPaymentMethods([...mockPaymentMethods]);
        return mockPaymentMethods[index];
      }
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/payment-methods/${id}/toggle-active`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      await fetchPaymentMethods();
      return response.data;
    } catch (err) {
      setError(`Error al cambiar el estado de la forma de pago con ID ${id}`);
      console.error('Error toggling payment method active state:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  // Cargar formas de pago al montar el componente
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    getPaymentMethodById,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodActive,
  };
};

// Función para verificar si un usuario tiene el permiso para administrar formas de pago
export const hasPaymentMethodAdminPermission = (userPermissions: string[]): boolean => {
  return userPermissions.includes('admin_forma_pago');
};

// Función para verificar si un usuario tiene el permiso para ver formas de pago
export const hasPaymentMethodViewPermission = (userPermissions: string[]): boolean => {
  return userPermissions.includes('ver_forma_pago');
};

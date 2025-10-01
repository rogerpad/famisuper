import { useState } from 'react';
import { BalanceSale, BalanceSaleFormData } from './types';
import { API_BASE_URL } from '../api';

export const useBalanceSales = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceSales = async (activo?: boolean): Promise<BalanceSale[]> => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/balance-sales`;
      if (activo !== undefined) {
        url += `?activo=${activo}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error al obtener ventas de saldo: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener ventas de saldo');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSaleById = async (id: number): Promise<BalanceSale | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/balance-sales/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error al obtener venta de saldo: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener venta de saldo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createBalanceSale = async (balanceSale: BalanceSaleFormData): Promise<BalanceSale | null> => {
    setLoading(true);
    setError(null);
    try {
      // Convertir explícitamente los tipos de datos antes de enviar
      const formattedData = {
        ...balanceSale,
        usuarioId: Number(balanceSale.usuarioId),
        telefonicaId: Number(balanceSale.telefonicaId),
        flujoSaldoId: Number(balanceSale.flujoSaldoId),
        paqueteId: balanceSale.paqueteId ? Number(balanceSale.paqueteId) : undefined,
        cantidad: Number(balanceSale.cantidad),
        monto: Number(balanceSale.monto),
      };
      
      const response = await fetch(`${API_BASE_URL}/balance-sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        throw new Error(`Error al crear venta de saldo: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al crear venta de saldo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBalanceSale = async (id: number, balanceSale: Partial<BalanceSale>): Promise<BalanceSale | null> => {
    setLoading(true);
    setError(null);
    try {
      // Asegurar que los campos numéricos sean números
      const formattedData = { ...balanceSale };
      
      // Forzar conversión de todos los campos numéricos
      formattedData.usuarioId = Number(formattedData.usuarioId);
      formattedData.telefonicaId = Number(formattedData.telefonicaId);
      formattedData.flujoSaldoId = Number(formattedData.flujoSaldoId);
      formattedData.cantidad = Number(formattedData.cantidad);
      formattedData.monto = Number(formattedData.monto);
      
      // Manejar paqueteId que puede ser undefined
      if (formattedData.paqueteId !== undefined) {
        formattedData.paqueteId = Number(formattedData.paqueteId);
      }
      
      console.log('Datos formateados para enviar al backend:', formattedData);
      
      const response = await fetch(`${API_BASE_URL}/balance-sales/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        throw new Error(`Error al actualizar venta de saldo: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar venta de saldo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBalanceSale = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/balance-sales/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error al eliminar venta de saldo: ${response.statusText}`);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar venta de saldo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchBalanceSales,
    fetchBalanceSaleById,
    createBalanceSale,
    updateBalanceSale,
    deleteBalanceSale,
  };
};

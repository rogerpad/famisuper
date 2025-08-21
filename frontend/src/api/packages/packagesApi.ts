import { useState } from 'react';
import { Package, PackageFormData } from './types';

// URL base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';

// Hook personalizado para consumir la API de paquetes
export const usePackages = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener el token de autenticación
  const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
  };

  // Obtener todos los paquetes
  const fetchPackages = async (): Promise<Package[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener paquetes: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error desconocido al obtener paquetes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener un paquete por ID
  const fetchPackageById = async (id: number): Promise<Package | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener paquete: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error desconocido al obtener paquete');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo paquete
  const createPackage = async (packageData: PackageFormData): Promise<Package | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        throw new Error(`Error al crear paquete: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error desconocido al crear paquete');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un paquete existente
  const updatePackage = async (id: number, packageData: PackageFormData): Promise<Package | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar paquete: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'Error desconocido al actualizar paquete');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un paquete
  const deletePackage = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar paquete: ${response.statusText}`);
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Error desconocido al eliminar paquete');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchPackages,
    fetchPackageById,
    createPackage,
    updatePackage,
    deletePackage
  };
};

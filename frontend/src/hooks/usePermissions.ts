import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

interface DecodedToken {
  sub: string;
  username: string;
  permisos?: string[];
  permissions?: string[];
  exp: number;
  iat: number;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        // Buscar permisos tanto en decoded.permisos como en decoded.permissions
        setPermissions(decoded.permissions || decoded.permisos || []);
        console.log('[USE_PERMISSIONS] Permisos decodificados:', decoded.permissions || decoded.permisos || []);
      } catch (error) {
        console.error('[USE_PERMISSIONS] Error al decodificar token:', error);
        setPermissions([]);
      }
    }
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return { permissions, hasPermission };
};

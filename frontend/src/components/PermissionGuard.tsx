import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
  permissionCode?: string;
  roleName?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que controla la visibilidad de elementos UI basado en permisos o roles
 * 
 * @param permissionCode - Código del permiso requerido
 * @param roleName - Nombre del rol requerido
 * @param children - Elementos a mostrar si el usuario tiene el permiso o rol
 * @param fallback - Elemento opcional a mostrar si el usuario no tiene el permiso o rol
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissionCode,
  roleName,
  children,
  fallback = null
}) => {
  const { hasPermission, hasRole } = useAuth();
  
  // Si no se especifica permiso ni rol, siempre mostrar el contenido
  if (!permissionCode && !roleName) {
    return <>{children}</>;
  }
  
  // Verificar permisos y roles
  const hasAccess = (
    (permissionCode && hasPermission(permissionCode)) || 
    (roleName && hasRole(roleName))
  );
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;

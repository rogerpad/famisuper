import React, { ReactNode } from 'react';
import { useUserPermissionsMap } from '../../api/permisos/userPermissionsApi';

interface PermissionGuardProps {
  permissionCode: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente que renderiza su contenido solo si el usuario tiene el permiso especificado
 * @param permissionCode Código del permiso requerido
 * @param children Contenido a renderizar si el usuario tiene el permiso
 * @param fallback Contenido a renderizar si el usuario no tiene el permiso (opcional)
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissionCode,
  children,
  fallback = null,
}) => {
  const { data: permissionsMap, isLoading, error } = useUserPermissionsMap();

  // Si está cargando o hay un error, no mostrar nada
  if (isLoading || error) {
    return null;
  }

  // Si el usuario tiene el permiso, mostrar el contenido
  if (permissionsMap && permissionsMap[permissionCode]) {
    return <>{children}</>;
  }

  // Si el usuario no tiene el permiso, mostrar el fallback
  return <>{fallback}</>;
};

interface PermissionGuardMultipleProps {
  permissionCodes: string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente que renderiza su contenido solo si el usuario tiene todos o alguno de los permisos especificados
 * @param permissionCodes Array de códigos de permisos requeridos
 * @param requireAll Si es true, el usuario debe tener todos los permisos; si es false, basta con uno (por defecto: false)
 * @param children Contenido a renderizar si el usuario tiene los permisos
 * @param fallback Contenido a renderizar si el usuario no tiene los permisos (opcional)
 */
export const PermissionGuardMultiple: React.FC<PermissionGuardMultipleProps> = ({
  permissionCodes,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { data: permissionsMap, isLoading, error } = useUserPermissionsMap();

  // Si está cargando o hay un error, no mostrar nada
  if (isLoading || error) {
    return null;
  }

  if (permissionsMap) {
    if (requireAll) {
      // Verificar si el usuario tiene todos los permisos
      const hasAllPermissions = permissionCodes.every(code => permissionsMap[code]);
      if (hasAllPermissions) {
        return <>{children}</>;
      }
    } else {
      // Verificar si el usuario tiene al menos un permiso
      const hasSomePermission = permissionCodes.some(code => permissionsMap[code]);
      if (hasSomePermission) {
        return <>{children}</>;
      }
    }
  }

  // Si el usuario no tiene los permisos requeridos, mostrar el fallback
  return <>{fallback}</>;
};

/**
 * Hook personalizado para verificar si el usuario tiene un permiso específico
 * @param permissionCode Código del permiso a verificar
 * @returns boolean indicando si el usuario tiene el permiso
 */
export const useHasPermission = (permissionCode: string): boolean => {
  const { data: permissionsMap } = useUserPermissionsMap();
  return !!permissionsMap && !!permissionsMap[permissionCode];
};

/**
 * Hook personalizado para verificar si el usuario tiene todos o alguno de los permisos especificados
 * @param permissionCodes Array de códigos de permisos a verificar
 * @param requireAll Si es true, el usuario debe tener todos los permisos; si es false, basta con uno (por defecto: false)
 * @returns boolean indicando si el usuario tiene los permisos
 */
export const useHasPermissions = (
  permissionCodes: string[],
  requireAll = false
): boolean => {
  const { data: permissionsMap } = useUserPermissionsMap();

  if (!permissionsMap) {
    return false;
  }

  if (requireAll) {
    return permissionCodes.every(code => permissionsMap[code]);
  }

  return permissionCodes.some(code => permissionsMap[code]);
};

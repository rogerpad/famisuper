import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Verificar si el usuario tiene permisos en user.permissions (como se asigna en JwtStrategy)
    // o en user.permisos (para mantener compatibilidad con código existente)
    if (!user || (!user.permissions && !user.permisos)) {
      console.log('Usuario sin permisos:', user);
      return false;
    }

    // Usar user.permissions si está disponible, de lo contrario usar user.permisos
    const userPermissions = user.permissions || user.permisos || [];
    
    console.log('Permisos requeridos:', requiredPermissions);
    console.log('Permisos del usuario:', userPermissions);
    
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }
}

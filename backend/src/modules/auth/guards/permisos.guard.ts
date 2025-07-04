import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISO_KEY } from '../decorators/requiere-permiso.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermisos = this.reflector.getAllAndOverride<string[]>(PERMISO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermisos) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Verificar si el usuario tiene los permisos requeridos
    // Los permisos están en la propiedad 'permissions' del objeto user
    console.log('Usuario:', user);
    console.log('Permisos requeridos:', requiredPermisos);
    console.log('Permisos del usuario:', user.permissions);
    
    return requiredPermisos.some((permiso) => 
      user.permissions?.includes(permiso)
    );
  }
}

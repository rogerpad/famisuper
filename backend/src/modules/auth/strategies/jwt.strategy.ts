import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'famisuper_secret_key',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user || !user.activo) {
        throw new UnauthorizedException('Usuario no válido o inactivo');
      }
      
      // Actualizar el último acceso del usuario
      await this.usersService.updateLastAccess(user.id);
      
      // Obtener los permisos del payload
      const userPermissions = payload.permissions || [];
      
      console.log('Permisos del token JWT:', userPermissions);
      
      // Incluir los permisos del payload en el objeto de usuario
      // Asignar a ambos campos para mantener compatibilidad
      return {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        rol_id: user.rol_id,
        rol: user.rol,
        permissions: userPermissions, // Formato nuevo
        permisos: userPermissions,    // Formato antiguo para compatibilidad
      };
    } catch (error) {
      console.error('Error en la validación JWT:', error);
      throw new UnauthorizedException('Error de autenticación');
    }
  }
}

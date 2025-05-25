import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByUsername(username);
      
      if (user && await this.comparePassword(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error en validateUser:', error);
      return null;
    }
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }
    
    const payload = {
      sub: user.id,
      username: user.username,
      rol: user.rol.id,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
        // Comentado temporalmente porque estas propiedades no existen en la entidad
        // fecha_registro: user.fecha_registro,
        // ultimo_acceso: user.ultimo_acceso
      },
    };
  }

  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

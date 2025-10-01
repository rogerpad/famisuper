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
      console.log(`Intentando validar usuario: ${username}`);
      
      // Buscar el usuario por nombre de usuario
      let user;
      try {
        user = await this.usersService.findByUsername(username);
        console.log(`Usuario encontrado: ${user.username}, ID: ${user.id}, Activo: ${user.activo}`);
      } catch (error) {
        console.error(`Usuario no encontrado: ${username}`, error.message);
        return null;
      }
      
      // Verificar si la contraseña es correcta
      console.log('Comparando contraseñas...');
      const isPasswordValid = await this.comparePassword(password, user.password);
      console.log(`Contraseña válida: ${isPasswordValid}`);
      
      if (isPasswordValid) {
        // Eliminar la contraseña del objeto usuario antes de devolverlo
        const { password, ...result } = user;
        return result;
      }
      
      console.log('Contraseña incorrecta');
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
      console.log(`Error en login: Usuario inactivo`);
      throw new UnauthorizedException('Usuario inactivo');
    }
    
    // Obtener los permisos del usuario basados en su rol
    const userPermissions = await this.getUserPermissions(user.id);
    
    const payload = {
      sub: user.id,
      username: user.username,
      rol: user.rol.id,
      rolName: user.rol.nombre,
      permissions: userPermissions
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        // Comentado temporalmente porque estas propiedades no existen en la entidad
        // fecha_registro: user.fecha_registro,
        // ultimo_acceso: user.ultimo_acceso
      },
    };
  }

  /**
   * Obtiene los códigos de permisos de un usuario basados en su rol
   */
  private async getUserPermissions(userId: number): Promise<string[]> {
    try {
      // Obtener el usuario con su rol
      const user = await this.usersService.findOne(userId);
      
      if (!user || !user.rol) {
        console.warn(`Usuario ${userId} no tiene rol asignado`);
        return [];
      }
      
      // Consultar los permisos del rol del usuario
      const query = `
        SELECT DISTINCT p.codigo
        FROM tbl_permisos p
        JOIN tbl_permisos_roles pr ON p.id = pr.permiso_id
        WHERE pr.rol_id = $1 AND p.codigo IS NOT NULL
      `;
      
      // Usar el repositorio del servicio de usuarios para ejecutar la consulta
      const entityManager = this.usersService['usersRepository'].manager;
      const result = await entityManager.query(query, [user.rol.id]);
      
      // Extraer los códigos de permisos
      return result.map(row => row.codigo);
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      return [];
    }
  }

  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    console.log('Comparando contraseña plana con hash');
    try {
      const result = await bcrypt.compare(plainPassword, hashedPassword);
      console.log(`Resultado de la comparación: ${result}`);
      return result;
    } catch (error) {
      console.error('Error al comparar contraseñas:', error);
      return false;
    }
  }
}

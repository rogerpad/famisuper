import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { RolesService } from '../modules/roles/roles.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usersService = app.get(UsersService);
    const rolesService = app.get(RolesService);
    
    console.log('Buscando roles disponibles...');
    const roles = await rolesService.findAll();
    console.log(`Roles encontrados: ${roles.length}`);
    
    if (roles.length === 0) {
      console.log('No hay roles disponibles. Creando rol de administrador...');
      const adminRole = await rolesService.create({
        nombre: 'Administrador',
        descripcion: 'Rol con acceso completo al sistema',
        activo: true
      });
      console.log('Rol de administrador creado:', adminRole);
    }
    
    // Obtener el primer rol disponible (o el que acabamos de crear)
    const role = roles.length > 0 ? roles[0] : await rolesService.findAll().then(r => r[0]);
    
    console.log('Creando usuario de prueba...');
    const testUser = await usersService.create({
      username: 'test',
      password: 'test123',
      nombre: 'Usuario',
      apellido: 'De Prueba',
      email: 'test@example.com',
      rol_id: role.id,
      activo: true
    });
    
    console.log('Usuario de prueba creado:');
    console.log(`ID: ${testUser.id}, Username: ${testUser.username}, Nombre: ${testUser.nombre}, Rol ID: ${testUser.rol_id}`);
    console.log('Credenciales para iniciar sesión:');
    console.log('Username: test');
    console.log('Password: test123');
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

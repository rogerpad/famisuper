import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usersService = app.get(UsersService);
    console.log('Listando usuarios disponibles:');
    
    const users = await usersService.findAll();
    
    users.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.username}, Nombre: ${user.nombre}, Activo: ${user.activo}, Rol: ${user.rol?.nombre || 'Sin rol'}`);
    });
    
    console.log(`Total de usuarios: ${users.length}`);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

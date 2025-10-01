import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException(`El usuario con nombre de usuario ${createUserDto.username} ya existe`);
    }

    // Verificar si el correo ya existe
    if (createUserDto.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException(`El correo electrónico ${createUserDto.email} ya está registrado`);
      }
    }

    // Encriptar la contraseña
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // Obtener el siguiente ID disponible
    const maxIdResult = await this.usersRepository.query('SELECT MAX(id) as max_id FROM tbl_usuarios');
    const nextId = maxIdResult[0].max_id ? parseInt(maxIdResult[0].max_id) + 1 : 1;
    
    // Crear el nuevo usuario
    const newUser = this.usersRepository.create({
      id: nextId,
      ...createUserDto,
      password: hashedPassword,
      activo: createUserDto.activo !== undefined ? createUserDto.activo : true,
    });

    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['rol'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['rol'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['rol'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con nombre de usuario ${username} no encontrado`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    console.log(`Iniciando actualización de usuario con ID ${id}`, updateUserDto);
    
    try {
      // Verificar si el usuario existe
      const user = await this.findOne(id);
      console.log('Usuario encontrado:', user);

      // Si se está actualizando el nombre de usuario, verificar que no exista otro con ese nombre
      if (updateUserDto.username && updateUserDto.username !== user.username) {
        const existingUser = await this.usersRepository.findOne({
          where: { username: updateUserDto.username },
        });

        if (existingUser && existingUser.id !== id) {
          throw new ConflictException(`El usuario con nombre de usuario ${updateUserDto.username} ya existe`);
        }
      }

      // Si se está actualizando el correo, verificar que no exista otro con ese correo
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingEmail = await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        });

        if (existingEmail && existingEmail.id !== id) {
          throw new ConflictException(`El correo electrónico ${updateUserDto.email} ya está registrado`);
        }
      }

      // Si se está actualizando la contraseña, encriptarla
      if (updateUserDto.password) {
        updateUserDto.password = await this.hashPassword(updateUserDto.password);
      }

      // Crear una copia limpia de los datos para actualizar
      const updateData: any = {};
      
      // Solo incluir los campos que están presentes en el DTO
      if (updateUserDto.username !== undefined) updateData.username = updateUserDto.username;
      if (updateUserDto.password !== undefined) updateData.password = updateUserDto.password;
      if (updateUserDto.nombre !== undefined) updateData.nombre = updateUserDto.nombre;
      if (updateUserDto.apellido !== undefined) updateData.apellido = updateUserDto.apellido;
      if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
      if (updateUserDto.activo !== undefined) updateData.activo = updateUserDto.activo;
      if (updateUserDto.rol_id !== undefined) updateData.rol_id = updateUserDto.rol_id;
      
      console.log('Datos a actualizar:', updateData);
      
      // Actualizar el usuario directamente en la base de datos
      const result = await this.usersRepository.update(id, updateData);
      console.log('Resultado de la actualización:', result);
      
      // Retornar el usuario actualizado
      return this.findOne(id);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByUsername(username);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // Actualizar el último acceso del usuario
        await this.updateLastAccess(user.id);
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error al validar usuario:', error);
      return null;
    }
  }
  
  /**
   * Actualiza la fecha de último acceso de un usuario
   * @param id ID del usuario
   */
  async updateLastAccess(id: number): Promise<void> {
    // Comentado temporalmente porque la columna ultimo_acceso no está en la entidad
    // try {
    //   await this.usersRepository.update(id, {
    //     ultimo_acceso: new Date()
    //   });
    //   console.log(`Último acceso actualizado para el usuario con ID ${id}`);
    // } catch (error) {
    //   console.error(`Error al actualizar el último acceso del usuario con ID ${id}:`, error);
    // }
    console.log(`Simulando actualización de último acceso para el usuario con ID ${id}`);
  }
}

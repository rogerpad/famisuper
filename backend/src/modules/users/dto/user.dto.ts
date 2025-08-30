import { Role } from '../../roles/entities/role.entity';

export class UserDto {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  rol_id: number;
  activo: boolean;
  rol?: Role;
}

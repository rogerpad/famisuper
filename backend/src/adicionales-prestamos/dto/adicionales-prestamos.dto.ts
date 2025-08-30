import { UserDto } from '../../modules/users/dto/user.dto';

export class AdicionalesPrestamosDto {
  id: number;
  usuarioId: number;
  usuario?: UserDto;
  acuerdo: string;
  origen: string;
  monto: number;
  descripcion: string;
  fecha: Date;
  activo: boolean;
}

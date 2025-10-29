import { UserDto } from '../../users/dto/user.dto';

export class AdditionalLoanDto {
  id: number;
  usuarioId: number;
  usuario?: UserDto;
  acuerdo: string;
  origen: string;
  monto: number;
  descripcion: string;
  fecha: Date;
  activo: boolean;
  cajaNumero?: number | null;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateAdicionalesPrestamosDto } from './create-adicionales-prestamos.dto';

export class UpdateAdicionalesPrestamosDto extends PartialType(CreateAdicionalesPrestamosDto) {}

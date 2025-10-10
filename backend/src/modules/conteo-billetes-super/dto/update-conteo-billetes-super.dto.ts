import { PartialType } from '@nestjs/mapped-types';
import { CreateConteoBilletesSuperDto } from './create-conteo-billetes-super.dto';

export class UpdateConteoBilletesSuperDto extends PartialType(CreateConteoBilletesSuperDto) {}

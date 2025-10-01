import { PartialType } from '@nestjs/mapped-types';
import { CreateCierreSuperDto } from './create-cierre-super.dto';

export class UpdateCierreSuperDto extends PartialType(CreateCierreSuperDto) {}

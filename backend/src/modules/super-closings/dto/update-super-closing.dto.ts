import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperClosingDto } from './create-super-closing.dto';

export class UpdateSuperClosingDto extends PartialType(CreateSuperClosingDto) {}

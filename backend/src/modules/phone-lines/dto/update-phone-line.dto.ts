import { PartialType } from '@nestjs/mapped-types';
import { CreatePhoneLineDto } from './create-phone-line.dto';

export class UpdatePhoneLineDto extends PartialType(CreatePhoneLineDto) {}

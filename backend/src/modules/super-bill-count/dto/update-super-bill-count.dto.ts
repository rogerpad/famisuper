import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperBillCountDto } from './create-super-bill-count.dto';

export class UpdateSuperBillCountDto extends PartialType(CreateSuperBillCountDto) {}

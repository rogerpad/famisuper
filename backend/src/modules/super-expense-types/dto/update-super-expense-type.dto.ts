import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperExpenseTypeDto } from './create-super-expense-type.dto';

export class UpdateSuperExpenseTypeDto extends PartialType(CreateSuperExpenseTypeDto) {}

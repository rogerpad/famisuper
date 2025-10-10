import { PartialType } from '@nestjs/mapped-types';
import { CreateSuperExpenseDto } from './create-super-expense.dto';

export class UpdateSuperExpenseDto extends PartialType(CreateSuperExpenseDto) {}

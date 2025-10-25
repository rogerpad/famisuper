import { PartialType } from '@nestjs/mapped-types';
import { CreateAdditionalLoanDto } from './create-additional-loan.dto';

export class UpdateAdditionalLoanDto extends PartialType(CreateAdditionalLoanDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateBalanceSaleDto } from './create-balance-sale.dto';

export class UpdateBalanceSaleDto extends PartialType(CreateBalanceSaleDto) {}

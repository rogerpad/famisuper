import { PartialType } from '@nestjs/mapped-types';
import { CreateBalanceFlowDto } from './create-balance-flow.dto';
import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBalanceFlowDto extends PartialType(CreateBalanceFlowDto) {
  @IsOptional()
  @Type(() => Date)
  fecha?: Date;
}

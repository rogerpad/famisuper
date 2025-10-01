import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateFormulaConfigDto } from './create-formula-config.dto';

export class UpdateFormulaConfigDto extends PartialType(CreateFormulaConfigDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentClosingDto } from './create-agent-closing.dto';
import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAgentClosingDto extends PartialType(CreateAgentClosingDto) {
  @ApiProperty({ description: 'Adicional CTA del cierre', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'El adicional CTA debe ser un número' })
  adicionalCta?: number;
}

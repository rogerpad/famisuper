import { PartialType } from '@nestjs/swagger';
import { CreateAgentClosingDto } from './create-agent-closing.dto';

export class UpdateAgentClosingDto extends PartialType(CreateAgentClosingDto) {}

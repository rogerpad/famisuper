import { PartialType } from '@nestjs/swagger';
import { CreateProviderTypeDto } from './create-provider-type.dto';

export class UpdateProviderTypeDto extends PartialType(CreateProviderTypeDto) {}

import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCounterDto } from './counter-create.dto';

export class UpdateCounterDto extends PartialType(OmitType(CreateCounterDto, ['branch'] as const)) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreatePreferenceDto } from './preference-create.dto';

export class UpdatePreferenceDto extends PartialType(CreatePreferenceDto) {}

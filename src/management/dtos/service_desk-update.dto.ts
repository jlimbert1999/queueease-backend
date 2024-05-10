import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateServiceDeskDto } from './service_desk-create.dto';

export class UpdateServiceDeskDto extends PartialType(OmitType(CreateServiceDeskDto, ['branch'] as const)) {}

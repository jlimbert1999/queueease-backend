import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './branch-create.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}

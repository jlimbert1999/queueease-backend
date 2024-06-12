import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './category-create.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

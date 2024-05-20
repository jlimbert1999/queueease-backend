import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateRequestServiceDto {
  @IsNumber()
  @Type(() => Number)
  id_service: number;

  @IsNumber()
  @Type(() => Number)
  id_branch: number;

  @IsNumber()
  @Type(() => Number)
  priority: number;
}

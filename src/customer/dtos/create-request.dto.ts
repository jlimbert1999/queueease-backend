import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateRequestServiceDto {
  @IsNumber()
  @Type(() => Number)
  service: number;

  @IsNumber()
  @Type(() => Number)
  priority: number;

  @IsNumber()
  @Type(() => Number)
  branch: number;
}

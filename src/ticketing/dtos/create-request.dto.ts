import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class CreateRequestServiceDto {
  @IsUUID()
  id_service: string;

  @IsUUID()
  id_branch: string;

  @IsNumber()
  @Type(() => Number)
  priority: number;
}

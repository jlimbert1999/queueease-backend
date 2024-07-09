import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateRequestServiceDto {
  @IsUUID()
  id_service: string;

  @IsUUID()
  id_branch: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  preferenceId: number;
}

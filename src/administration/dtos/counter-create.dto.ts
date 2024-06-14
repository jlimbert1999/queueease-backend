import { Type } from 'class-transformer';
import { IsString, IsPositive, IsInt, Min, IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCounterDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  number: number;

  @IsString()
  @IsNotEmpty()
  ip: string;

  @IsUUID()
  branch: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];
}

import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsPositive, IsInt, Min, IsArray, IsUUID, IsOptional } from 'class-validator';

export class CreateCounterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  number: number;

  @IsUUID()
  branch: string;

  @IsUUID()
  @IsOptional()
  user?: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];
}

import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePreferenceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  acronym: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority: number;
}

export class UpdatePreferenceDto extends PartialType(CreatePreferenceDto) {}

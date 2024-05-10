import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsPositive, IsInt, Min, IsArray } from 'class-validator';

export class CreateServiceDeskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  number: number;

  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @Type(() => Number)
  @IsInt()
  branch: number;

  @IsArray()
  @IsInt({ each: true })
  services: number[];
}

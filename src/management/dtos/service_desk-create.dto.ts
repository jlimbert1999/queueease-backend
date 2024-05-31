import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsPositive, IsInt, Min, IsArray, IsUUID } from 'class-validator';

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

  @IsUUID()
  branch: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];
}

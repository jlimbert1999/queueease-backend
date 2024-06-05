import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { VideoPlatform } from '../entities';
import { Type } from 'class-transformer';

export class BranchVideoDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsEnum(VideoPlatform)
  platform: VideoPlatform;
}

export class CreateBranchDto {
  @IsNotEmpty()
  name: string;

  @IsString()
  marqueeMessage: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BranchVideoDto)
  videos: BranchVideoDto[];
}

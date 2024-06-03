import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { VideoPlatform } from '../entities';

export class CreateBranchDto {
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];

  @IsString()
  videoUrl: string;

  @IsEnum(VideoPlatform)
  videoPlatform: string;

  @IsString()
  marqueeMessage: string;
}

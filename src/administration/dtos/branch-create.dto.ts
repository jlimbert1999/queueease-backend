import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  marqueeMessage: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  services: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  videos: string[];

  @IsString()
  @IsOptional()
  alertVideoUrl?: string;
}

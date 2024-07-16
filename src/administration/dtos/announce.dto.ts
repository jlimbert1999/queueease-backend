import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnnounceDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  url: string | null;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  branches: string[];
}

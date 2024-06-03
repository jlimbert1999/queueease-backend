import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];
}

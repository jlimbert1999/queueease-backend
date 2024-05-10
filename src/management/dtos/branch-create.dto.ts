import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsInt({ each: true })
  services: number[];
}

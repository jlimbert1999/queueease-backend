import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole, { each: true })
  @IsOptional()
  roles?: UserRole[];

  @IsBoolean()
  isActive: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

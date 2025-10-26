import { IsEmail, IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['USER', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'])
  role?: string = 'USER';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean = false;

  @IsOptional()
  profile?: any;
}

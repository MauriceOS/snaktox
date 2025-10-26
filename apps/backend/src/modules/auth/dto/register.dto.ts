import { IsEmail, IsString, MinLength, IsOptional, IsIn, IsDateString, IsArray } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
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
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}

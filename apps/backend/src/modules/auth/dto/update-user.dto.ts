import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsIn(['USER', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'])
  role?: string;
}

import { IsString, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;
}

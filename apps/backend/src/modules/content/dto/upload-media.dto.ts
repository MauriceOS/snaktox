import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class UploadMediaDto {
  @IsString()
  @IsIn(['snakes', 'hospitals', 'education', 'emergency', 'general'])
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

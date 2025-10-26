import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsIn(['prevention', 'first_aid', 'treatment', 'awareness', 'emergency'])
  category: string;

  @IsOptional()
  @IsString()
  language?: string = 'en';

  @IsString()
  source: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

import { IsString, IsOptional, IsArray, IsBoolean, IsIn } from 'class-validator';

export class CreateCommunityPostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsIn(['story', 'question', 'tip', 'alert', 'discussion'])
  type: string;

  @IsString()
  @IsIn(['prevention', 'first_aid', 'treatment', 'awareness', 'emergency', 'general'])
  category: string;

  @IsString()
  authorId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean = true;
}

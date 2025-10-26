import { IsString, IsIn } from 'class-validator';

export class CreateTranslationDto {
  @IsString()
  contentId: string;

  @IsString()
  content: string;

  @IsString()
  @IsIn(['en', 'sw', 'fr', 'ar', 'am', 'ha', 'yo', 'ig', 'zu', 'xh'])
  language: string;

  @IsString()
  translator: string;
}

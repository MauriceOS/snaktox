import { IsString, IsOptional, IsArray, IsDateString, IsIn } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsIn(['awareness', 'prevention', 'education', 'emergency', 'fundraising'])
  type: string;

  @IsString()
  @IsIn(['general_public', 'healthcare_workers', 'students', 'rural_communities', 'urban_communities'])
  targetAudience: string;

  @IsString()
  @IsIn(['kenya', 'east_africa', 'west_africa', 'south_africa', 'central_africa', 'global'])
  region: string;

  @IsString()
  @IsIn(['en', 'sw', 'fr', 'ar', 'am', 'ha', 'yo', 'ig', 'zu', 'xh'])
  language: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  createdBy: string;
}

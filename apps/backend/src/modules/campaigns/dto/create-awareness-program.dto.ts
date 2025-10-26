import { IsString, IsOptional, IsArray, IsDateString, IsNumber, IsIn } from 'class-validator';

export class CreateAwarenessProgramDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsIn(['workshop', 'seminar', 'campaign', 'training', 'community_outreach'])
  type: string;

  @IsString()
  targetAudience: string;

  @IsString()
  region: string;

  @IsString()
  language: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @IsArray()
  @IsString({ each: true })
  activities: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partners?: string[];

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsString()
  createdBy: string;
}
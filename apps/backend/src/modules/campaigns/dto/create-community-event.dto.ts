import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsDateString, IsIn, Min } from 'class-validator';

export class CreateCommunityEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsIn(['workshop', 'seminar', 'training', 'awareness_campaign', 'fundraising', 'community_meeting'])
  type: string;

  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  organizerId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttendees?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @IsOptional()
  @IsBoolean()
  registrationRequired?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

import { IsString, IsOptional, IsUrl, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SnakeDetectionDto {
  @ApiProperty({ 
    description: 'URL of the snake image for AI detection',
    example: 'https://example.com/snake-image.jpg'
  })
  @IsString()
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ 
    description: 'Anonymized user identifier',
    example: 'user-001',
    required: false
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ 
    description: 'Session identifier',
    example: 'session-001',
    required: false
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ 
    description: 'Location data for emergency response',
    example: { lat: -1.2921, lng: 36.8219 },
    required: false
  })
  @IsObject()
  @IsOptional()
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

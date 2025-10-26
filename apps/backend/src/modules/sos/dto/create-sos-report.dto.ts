import { IsString, IsObject, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSosReportDto {
  @ApiProperty({ 
    description: 'GPS coordinates of the incident',
    example: { lat: -1.3048, lng: 36.8156 }
  })
  @IsObject()
  gpsCoordinates: {
    lat: number;
    lng: number;
  };

  @ApiProperty({ 
    description: 'URL of the snake image for AI identification',
    example: 'https://example.com/snake-image.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ 
    description: 'Field responder identifier',
    example: 'responder-001'
  })
  @IsString()
  responderId: string;

  @ApiProperty({ 
    description: 'Identified snake species ID',
    example: 'snake-species-001',
    required: false
  })
  @IsString()
  @IsOptional()
  snakeSpeciesId?: string;

  @ApiProperty({ 
    description: 'Anonymized victim information',
    example: {
      age: 'adult',
      gender: 'male',
      condition: 'conscious'
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  victimInfo?: {
    age?: string;
    gender?: string;
    condition?: string;
    weight?: number;
    allergies?: string[];
  };

  @ApiProperty({ 
    description: 'Reported symptoms',
    example: ['pain', 'swelling', 'nausea'],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @ApiProperty({ 
    description: 'First aid measures already applied',
    example: ['immobilized_limb', 'cleaned_wound'],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  firstAidApplied?: string[];

  @ApiProperty({ 
    description: 'Additional notes about the incident',
    example: 'Snake was approximately 1.5 meters long, brown color',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

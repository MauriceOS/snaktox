import { IsString, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatbotQueryDto {
  @ApiProperty({ 
    description: 'User query for first aid guidance',
    example: 'What should I do if someone is bitten by a snake?',
    minLength: 1,
    maxLength: 500
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  query: string;

  @ApiProperty({ 
    description: 'Additional context for the query',
    example: {
      snakeSpecies: 'Black Mamba',
      symptoms: ['pain', 'swelling'],
      location: 'Kenya'
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  context?: {
    snakeSpecies?: string;
    symptoms?: string[];
    location?: string;
    victimAge?: string;
    timeSinceBite?: string;
  };

  @ApiProperty({ 
    description: 'Language for the response',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';

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
}

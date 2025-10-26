import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindEducationMaterialsDto {
  @ApiProperty({ 
    description: 'Filter by category',
    enum: ['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'],
    required: false
  })
  @IsEnum(['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'])
  @IsOptional()
  category?: 'prevention' | 'first_aid' | 'treatment' | 'awareness' | 'emergency_contacts';

  @ApiProperty({ 
    description: 'Filter by language',
    example: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ 
    description: 'Filter by source',
    example: 'WHO',
    required: false
  })
  @IsString()
  @IsOptional()
  source?: string;
}

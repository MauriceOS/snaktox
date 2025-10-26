import { IsOptional, IsString, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEducationMaterialDto {
  @ApiProperty({ 
    description: 'Updated title of the education material',
    example: 'Updated Snakebite Prevention Guidelines',
    required: false
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiProperty({ 
    description: 'Updated content of the education material',
    example: '# Updated Snakebite Prevention Guidelines...',
    required: false
  })
  @IsString()
  @MinLength(100)
  @MaxLength(10000)
  @IsOptional()
  content?: string;

  @ApiProperty({ 
    description: 'Updated category of the education material',
    enum: ['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'],
    example: 'prevention',
    required: false
  })
  @IsEnum(['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'])
  @IsOptional()
  category?: 'prevention' | 'first_aid' | 'treatment' | 'awareness' | 'emergency_contacts';

  @ApiProperty({ 
    description: 'Updated language of the content',
    example: 'sw',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ 
    description: 'Updated source of the education material',
    example: 'WHO Guidelines for Snakebite Prevention 2024',
    required: false
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @IsOptional()
  source?: string;

  @ApiProperty({ 
    description: 'Updated author or translator',
    example: 'Dr. Mary Wanjiku, KEMRI',
    required: false
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ 
    description: 'Whether the material is active',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

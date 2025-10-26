import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEducationMaterialDto {
  @ApiProperty({ 
    description: 'Title of the education material',
    example: 'Snakebite Prevention Guidelines'
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ 
    description: 'Content of the education material (HTML or markdown)',
    example: '# Snakebite Prevention Guidelines\n\n## Key Prevention Strategies...'
  })
  @IsString()
  @MinLength(100)
  @MaxLength(10000)
  content: string;

  @ApiProperty({ 
    description: 'Category of the education material',
    enum: ['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'],
    example: 'prevention'
  })
  @IsEnum(['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'])
  category: 'prevention' | 'first_aid' | 'treatment' | 'awareness' | 'emergency_contacts';

  @ApiProperty({ 
    description: 'Language of the content',
    example: 'en',
    default: 'en'
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';

  @ApiProperty({ 
    description: 'Source of the education material',
    example: 'WHO Guidelines for Snakebite Prevention 2023'
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  source: string;

  @ApiProperty({ 
    description: 'Author or translator of the content',
    example: 'Dr. John Kamau, KEMRI',
    required: false
  })
  @IsString()
  @IsOptional()
  author?: string;
}

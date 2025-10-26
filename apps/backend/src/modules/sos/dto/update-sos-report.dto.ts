import { IsOptional, IsEnum, IsString, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSosReportDto {
  @ApiProperty({ 
    description: 'Status of the SOS report',
    enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    required: false
  })
  @IsEnum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  @ApiProperty({ 
    description: 'Updated snake species ID',
    example: 'snake-species-001',
    required: false
  })
  @IsString()
  @IsOptional()
  snakeSpeciesId?: string;

  @ApiProperty({ 
    description: 'Updated victim information',
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
    description: 'Updated symptoms',
    example: ['pain', 'swelling', 'nausea'],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @ApiProperty({ 
    description: 'Updated first aid measures',
    example: ['immobilized_limb', 'cleaned_wound'],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  firstAidApplied?: string[];

  @ApiProperty({ 
    description: 'Updated notes',
    example: 'Patient is stable, antivenom administered',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

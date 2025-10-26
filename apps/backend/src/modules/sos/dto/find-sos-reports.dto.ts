import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindSosReportsDto {
  @ApiProperty({ 
    description: 'Filter by SOS report status',
    enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    required: false
  })
  @IsEnum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  @ApiProperty({ 
    description: 'Filter by responder ID',
    example: 'responder-001',
    required: false
  })
  @IsString()
  @IsOptional()
  responderId?: string;

  @ApiProperty({ 
    description: 'Filter by hospital ID',
    example: 'hospital-001',
    required: false
  })
  @IsString()
  @IsOptional()
  hospitalId?: string;

  @ApiProperty({ 
    description: 'Filter by start date',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    description: 'Filter by end date',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

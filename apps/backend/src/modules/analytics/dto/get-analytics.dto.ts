import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAnalyticsDto {
  @ApiProperty({ 
    description: 'Start date for analytics period',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for analytics period',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

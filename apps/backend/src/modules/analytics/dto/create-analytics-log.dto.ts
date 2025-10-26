import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalyticsLogDto {
  @ApiProperty({ 
    description: 'Type of analytics event',
    example: 'sos_created'
  })
  @IsString()
  eventType: string;

  @ApiProperty({ 
    description: 'Event-specific metadata',
    example: {
      sosId: 'sos-001',
      responderId: 'responder-001',
      location: { lat: -1.3048, lng: 36.8156 },
      riskLevel: 'HIGH'
    }
  })
  @IsObject()
  metadata: Record<string, any>;

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

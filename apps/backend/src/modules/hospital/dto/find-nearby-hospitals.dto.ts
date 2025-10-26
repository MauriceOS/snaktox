import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindNearbyHospitalsDto {
  @ApiProperty({ 
    description: 'Latitude coordinate',
    example: -1.3048,
    minimum: -90,
    maximum: 90
  })
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ 
    description: 'Longitude coordinate',
    example: 36.8156,
    minimum: -180,
    maximum: 180
  })
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({ 
    description: 'Search radius in kilometers',
    example: 50,
    minimum: 1,
    maximum: 500,
    required: false,
    default: 50
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(500)
  radius?: number = 50;
}

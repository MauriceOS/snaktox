import { IsString, IsObject, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHospitalDto {
  @ApiProperty({ description: 'Hospital name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hospital location/address' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Country code (e.g., KE, TZ, UG)', example: 'KE' })
  @IsString()
  country: string;

  @ApiProperty({ 
    description: 'GPS coordinates',
    example: { lat: -1.3048, lng: 36.8156 }
  })
  @IsObject()
  coordinates: {
    lat: number;
    lng: number;
  };

  @ApiProperty({ 
    description: 'Contact information',
    example: {
      phone: '+254-20-2726300',
      emergency: '+254-20-2726300',
      email: 'info@knh.or.ke'
    }
  })
  @IsObject()
  contactInfo: {
    phone: string;
    emergency: string;
    email?: string;
    website?: string;
  };

  @ApiProperty({ 
    description: 'Antivenom stock information',
    example: {
      polyvalent: 25,
      monovalent: 15,
      lastUpdated: '2024-01-10'
    }
  })
  @IsObject()
  antivenomStock: {
    polyvalent: number;
    monovalent: number;
    lastUpdated: string;
  };

  @ApiProperty({ 
    description: 'Medical specialties',
    example: ['Emergency Medicine', 'Toxicology', 'Surgery']
  })
  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @ApiProperty({ 
    description: 'Operating hours',
    example: {
      emergency: '24/7',
      general: '08:00-17:00'
    }
  })
  @IsObject()
  operatingHours: {
    emergency: string;
    general: string;
  };

  @ApiProperty({ description: 'Emergency services available', default: true })
  @IsBoolean()
  @IsOptional()
  emergencyServices?: boolean = true;

  @ApiProperty({ description: 'Data source verification' })
  @IsString()
  source: string;
}

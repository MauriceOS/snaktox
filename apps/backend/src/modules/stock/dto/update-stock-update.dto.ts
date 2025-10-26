import { IsOptional, IsEnum, IsNumber, IsDateString, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockUpdateDto {
  @ApiProperty({ 
    description: 'Status of the stock update',
    enum: ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED', 'RECALLED'],
    required: false
  })
  @IsEnum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED', 'RECALLED'])
  @IsOptional()
  status?: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'RECALLED';

  @ApiProperty({ 
    description: 'Updated quantity of antivenom',
    example: 20,
    minimum: 0,
    maximum: 1000,
    required: false
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(1000)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ 
    description: 'Updated expiry date',
    example: '2024-12-31T00:00:00.000Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ 
    description: 'Updated batch number',
    example: 'SAIMR-2024-001',
    required: false
  })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ 
    description: 'Updated supplier information',
    example: 'South African Institute for Medical Research',
    required: false
  })
  @IsString()
  @IsOptional()
  supplier?: string;
}

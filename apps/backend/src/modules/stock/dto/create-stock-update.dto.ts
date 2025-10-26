import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockUpdateDto {
  @ApiProperty({ description: 'Hospital ID' })
  @IsString()
  hospitalId: string;

  @ApiProperty({ 
    description: 'Type of antivenom',
    example: 'Polyvalent Antivenom (SAIMR)'
  })
  @IsString()
  antivenomType: string;

  @ApiProperty({ 
    description: 'Quantity of antivenom available',
    example: 25,
    minimum: 0,
    maximum: 1000
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(1000)
  quantity: number;

  @ApiProperty({ 
    description: 'Expiry date of the antivenom',
    example: '2024-12-31T00:00:00.000Z'
  })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ 
    description: 'Batch number of the antivenom',
    example: 'SAIMR-2024-001',
    required: false
  })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ 
    description: 'Supplier of the antivenom',
    example: 'South African Institute for Medical Research',
    required: false
  })
  @IsString()
  @IsOptional()
  supplier?: string;
}

import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindStockByHospitalDto {
  @ApiProperty({ 
    description: 'Filter by stock status',
    enum: ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED', 'RECALLED'],
    required: false
  })
  @IsEnum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED', 'RECALLED'])
  @IsOptional()
  status?: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'RECALLED';

  @ApiProperty({ 
    description: 'Filter by antivenom type',
    example: 'Polyvalent Antivenom (SAIMR)',
    required: false
  })
  @IsString()
  @IsOptional()
  antivenomType?: string;
}

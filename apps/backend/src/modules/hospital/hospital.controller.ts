import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { FindNearbyHospitalsDto } from './dto/find-nearby-hospitals.dto';

@ApiTags('hospitals')
@Controller('hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get()
  @ApiOperation({ summary: 'Get all hospitals' })
  @ApiResponse({ status: 200, description: 'List of hospitals retrieved successfully' })
  async findAll(@Query('verified') verified?: boolean) {
    return this.hospitalService.findAll(verified);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find hospitals near a location' })
  @ApiResponse({ status: 200, description: 'Nearby hospitals found successfully' })
  async findNearby(@Query() query: FindNearbyHospitalsDto) {
    return this.hospitalService.findNearby(query.lat, query.lng, query.radius);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hospital by ID' })
  @ApiResponse({ status: 200, description: 'Hospital retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Hospital not found' })
  async findOne(@Param('id') id: string) {
    return this.hospitalService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new hospital' })
  @ApiResponse({ status: 201, description: 'Hospital created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBearerAuth()
  async create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalService.create(createHospitalDto);
  }
}

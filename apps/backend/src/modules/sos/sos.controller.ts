import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SosService } from './sos.service';
import { CreateSosReportDto } from './dto/create-sos-report.dto';
import { UpdateSosReportDto } from './dto/update-sos-report.dto';
import { FindSosReportsDto } from './dto/find-sos-reports.dto';

@ApiTags('sos')
@Controller('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Get()
  @ApiOperation({ summary: 'Get all SOS reports' })
  @ApiResponse({ status: 200, description: 'List of SOS reports retrieved successfully' })
  async findAll(@Query() query: FindSosReportsDto) {
    return this.sosService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active SOS reports' })
  @ApiResponse({ status: 200, description: 'Active SOS reports retrieved successfully' })
  async findActive() {
    return this.sosService.findActive();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby SOS reports' })
  @ApiResponse({ status: 200, description: 'Nearby SOS reports found successfully' })
  async findNearby(@Query('lat') lat: number, @Query('lng') lng: number, @Query('radius') radius?: number) {
    return this.sosService.findNearby(lat, lng, radius);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get SOS report statistics' })
  @ApiResponse({ status: 200, description: 'SOS statistics retrieved successfully' })
  async getStatistics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.sosService.getStatistics(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SOS report by ID' })
  @ApiResponse({ status: 200, description: 'SOS report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'SOS report not found' })
  async findOne(@Param('id') id: string) {
    return this.sosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new SOS report' })
  @ApiResponse({ status: 201, description: 'SOS report created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createSosReportDto: CreateSosReportDto) {
    return this.sosService.create(createSosReportDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SOS report status' })
  @ApiResponse({ status: 200, description: 'SOS report updated successfully' })
  @ApiResponse({ status: 404, description: 'SOS report not found' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateSosReportDto: UpdateSosReportDto) {
    return this.sosService.update(id, updateSosReportDto);
  }

  @Post(':id/assign-hospital')
  @ApiOperation({ summary: 'Assign hospital to SOS report' })
  @ApiResponse({ status: 200, description: 'Hospital assigned successfully' })
  @ApiResponse({ status: 404, description: 'SOS report or hospital not found' })
  @ApiBearerAuth()
  async assignHospital(@Param('id') id: string, @Body('hospitalId') hospitalId: string) {
    return this.sosService.assignHospital(id, hospitalId);
  }
}

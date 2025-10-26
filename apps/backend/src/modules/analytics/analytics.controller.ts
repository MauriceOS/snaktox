import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsLogDto } from './dto/create-analytics-log.dto';
import { GetAnalyticsDto } from './dto/get-analytics.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get analytics dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics retrieved successfully' })
  @ApiBearerAuth()
  async getDashboard(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getDashboard(query);
  }

  @Get('sos-reports')
  @ApiOperation({ summary: 'Get SOS report analytics' })
  @ApiResponse({ status: 200, description: 'SOS report analytics retrieved successfully' })
  @ApiBearerAuth()
  async getSosAnalytics(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getSosAnalytics(query);
  }

  @Get('hospitals')
  @ApiOperation({ summary: 'Get hospital performance analytics' })
  @ApiResponse({ status: 200, description: 'Hospital analytics retrieved successfully' })
  @ApiBearerAuth()
  async getHospitalAnalytics(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getHospitalAnalytics(query);
  }

  @Get('stock')
  @ApiOperation({ summary: 'Get antivenom stock analytics' })
  @ApiResponse({ status: 200, description: 'Stock analytics retrieved successfully' })
  @ApiBearerAuth()
  async getStockAnalytics(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getStockAnalytics(query);
  }

  @Get('education')
  @ApiOperation({ summary: 'Get education material analytics' })
  @ApiResponse({ status: 200, description: 'Education analytics retrieved successfully' })
  @ApiBearerAuth()
  async getEducationAnalytics(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getEducationAnalytics(query);
  }

  @Get('geographic')
  @ApiOperation({ summary: 'Get geographic distribution analytics' })
  @ApiResponse({ status: 200, description: 'Geographic analytics retrieved successfully' })
  @ApiBearerAuth()
  async getGeographicAnalytics(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getGeographicAnalytics(query);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get trend analysis' })
  @ApiResponse({ status: 200, description: 'Trend analysis retrieved successfully' })
  @ApiBearerAuth()
  async getTrends(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getTrends(query);
  }

  @Get('impact')
  @ApiOperation({ summary: 'Get impact metrics' })
  @ApiResponse({ status: 200, description: 'Impact metrics retrieved successfully' })
  @ApiBearerAuth()
  async getImpactMetrics(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getImpactMetrics(query);
  }

  @Post('log')
  @ApiOperation({ summary: 'Log analytics event' })
  @ApiResponse({ status: 201, description: 'Analytics event logged successfully' })
  async logEvent(@Body() createAnalyticsLogDto: CreateAnalyticsLogDto) {
    return this.analyticsService.logEvent(createAnalyticsLogDto);
  }
}

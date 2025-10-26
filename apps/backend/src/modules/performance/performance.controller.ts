import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CacheService } from './cache.service';
import { MonitoringService } from './monitoring.service';
import { OptimizationService } from './optimization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly cacheService: CacheService,
    private readonly monitoringService: MonitoringService,
    private readonly optimizationService: OptimizationService,
  ) {}

  @Get('overview')
  async getPerformanceOverview() {
    return this.performanceService.getPerformanceOverview();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async getPerformanceDashboard() {
    return this.performanceService.getPerformanceDashboard();
  }

  @Get('statistics')
  async getPerformanceStatistics() {
    return this.performanceService.getPerformanceStatistics();
  }

  @Get('trends')
  async getPerformanceTrends(@Query('timeframe') timeframe?: string) {
    return this.performanceService.getPerformanceTrends(timeframe);
  }

  @Get('alerts')
  async getPerformanceAlerts() {
    return this.performanceService.getPerformanceAlerts();
  }

  @Post('alerts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async createPerformanceAlert(@Body() alertData: any) {
    return this.performanceService.createPerformanceAlert(alertData);
  }

  @Post('optimize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async optimizePerformance() {
    return this.performanceService.optimizePerformance();
  }

  @Get('report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async generatePerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.performanceService.getPerformanceReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Cache endpoints
  @Get('cache/metrics')
  async getCacheMetrics() {
    return this.cacheService.getCacheMetrics();
  }

  @Get('cache/statistics')
  async getCacheStatistics() {
    return this.cacheService.getCacheStatistics();
  }

  @Post('cache/clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async clearCache() {
    await this.cacheService.clear();
    return { message: 'Cache cleared successfully' };
  }

  @Post('cache/warmup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async warmupCache() {
    await this.cacheService.warmupCache();
    return { message: 'Cache warmup completed successfully' };
  }

  @Post('cache/invalidate/hospital/:hospitalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async invalidateHospitalCache(@Param('hospitalId') hospitalId: string) {
    await this.cacheService.invalidateHospitalCache(hospitalId);
    return { message: 'Hospital cache invalidated successfully' };
  }

  @Post('cache/invalidate/snake/:snakeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async invalidateSnakeCache(@Param('snakeId') snakeId: string) {
    await this.cacheService.invalidateSnakeCache(snakeId);
    return { message: 'Snake cache invalidated successfully' };
  }

  @Post('cache/invalidate/education/:contentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async invalidateEducationCache(@Param('contentId') contentId: string) {
    await this.cacheService.invalidateEducationCache(contentId);
    return { message: 'Education cache invalidated successfully' };
  }

  // Monitoring endpoints
  @Get('monitoring/system')
  async getSystemMetrics() {
    return this.monitoringService.getSystemMetrics();
  }

  @Get('monitoring/application')
  async getApplicationMetrics() {
    return this.monitoringService.getApplicationMetrics();
  }

  @Get('monitoring/health')
  async getHealthStatus() {
    return this.monitoringService.getHealthStatus();
  }

  @Get('monitoring/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async getMonitoringDashboard() {
    return this.monitoringService.getMonitoringDashboard();
  }

  @Post('monitoring/alerts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async createHealthAlert(@Body() alertData: any) {
    return this.monitoringService.createHealthAlert(alertData);
  }

  // Optimization endpoints
  @Get('optimization/recommendations')
  async getOptimizationRecommendations() {
    return this.optimizationService.getOptimizationRecommendations();
  }

  @Get('optimization/history')
  async getOptimizationHistory() {
    return this.optimizationService.getOptimizationHistory();
  }

  @Get('optimization/statistics')
  async getOptimizationStatistics() {
    return this.optimizationService.getOptimizationStatistics();
  }

  @Post('optimization/database')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async optimizeDatabase() {
    await this.optimizationService.performOptimizations();
    return { message: 'Database optimization completed successfully' };
  }

  @Post('optimization/cache')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async optimizeCache() {
    await this.cacheService.warmupCache();
    return { message: 'Cache optimization completed successfully' };
  }

  @Post('optimization/system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async optimizeSystem() {
    await this.optimizationService.performOptimizations();
    return { message: 'System optimization completed successfully' };
  }
}

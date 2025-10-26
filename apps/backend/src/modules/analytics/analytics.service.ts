import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAnalyticsLogDto } from './dto/create-analytics-log.dto';
import { Logger } from '../../common/logger/logger.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger();

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(query: any) {
    this.logger.log('Generating dashboard analytics');
    
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);
    
    const [
      totalSosReports,
      activeSosReports,
      totalHospitals,
      verifiedHospitals,
      totalStock,
      lowStockAlerts,
      educationMaterials,
      recentActivity
    ] = await Promise.all([
      this.getTotalSosReports(dateFilter),
      this.getActiveSosReports(),
      this.getTotalHospitals(),
      this.getVerifiedHospitals(),
      this.getTotalStock(),
      this.getLowStockAlerts(),
      this.getEducationMaterials(),
      this.getRecentActivity(dateFilter)
    ]);

    this.logger.log('Dashboard analytics generated');
    return {
      overview: {
        totalSosReports,
        activeSosReports,
        totalHospitals,
        verifiedHospitals,
        totalStock,
        lowStockAlerts,
        educationMaterials,
      },
      recentActivity,
      lastUpdated: new Date(),
    };
  }

  async getSosAnalytics(query: any) {
    this.logger.log('Generating SOS report analytics');
    
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);
    
    const [
      statusDistribution,
      riskLevelDistribution,
      responseTimeStats,
      geographicDistribution,
      monthlyTrends,
      topResponders
    ] = await Promise.all([
      this.getSosStatusDistribution(dateFilter),
      this.getSosRiskLevelDistribution(dateFilter),
      this.getSosResponseTimeStats(dateFilter),
      this.getSosGeographicDistribution(dateFilter),
      this.getSosMonthlyTrends(dateFilter),
      this.getTopResponders(dateFilter)
    ]);

    this.logger.log('SOS analytics generated');
    return {
      statusDistribution,
      riskLevelDistribution,
      responseTimeStats,
      geographicDistribution,
      monthlyTrends,
      topResponders,
      period: {
        startDate: query.startDate || 'All time',
        endDate: query.endDate || 'Present',
      },
    };
  }

  async getHospitalAnalytics(query: any) {
    this.logger.log('Generating hospital performance analytics');
    
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);
    
    const [
      hospitalPerformance,
      responseTimeByHospital,
      antivenomAvailability,
      hospitalUtilization,
      topPerformingHospitals
    ] = await Promise.all([
      this.getHospitalPerformance(dateFilter),
      this.getResponseTimeByHospital(dateFilter),
      this.getAntivenomAvailability(),
      this.getHospitalUtilization(dateFilter),
      this.getTopPerformingHospitals(dateFilter)
    ]);

    this.logger.log('Hospital analytics generated');
    return {
      hospitalPerformance,
      responseTimeByHospital,
      antivenomAvailability,
      hospitalUtilization,
      topPerformingHospitals,
      period: {
        startDate: query.startDate || 'All time',
        endDate: query.endDate || 'Present',
      },
    };
  }

  async getStockAnalytics(query: any) {
    this.logger.log('Generating stock analytics');
    
    const [
      stockDistribution,
      expiryAlerts,
      lowStockAlerts,
      stockTrends,
      supplierAnalysis
    ] = await Promise.all([
      this.getStockDistribution(),
      this.getExpiryAlerts(),
      this.getLowStockAlerts(),
      this.getStockTrends(),
      this.getSupplierAnalysis()
    ]);

    this.logger.log('Stock analytics generated');
    return {
      stockDistribution,
      expiryAlerts,
      lowStockAlerts,
      stockTrends,
      supplierAnalysis,
      lastUpdated: new Date(),
    };
  }

  async getEducationAnalytics(query: any) {
    this.logger.log('Generating education analytics');
    
    const [
      categoryDistribution,
      languageDistribution,
      sourceDistribution,
      materialUsage,
      topMaterials
    ] = await Promise.all([
      this.getEducationCategoryDistribution(),
      this.getEducationLanguageDistribution(),
      this.getEducationSourceDistribution(),
      this.getMaterialUsage(),
      this.getTopMaterials()
    ]);

    this.logger.log('Education analytics generated');
    return {
      categoryDistribution,
      languageDistribution,
      sourceDistribution,
      materialUsage,
      topMaterials,
      lastUpdated: new Date(),
    };
  }

  async getGeographicAnalytics(query: any) {
    this.logger.log('Generating geographic analytics');
    
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);
    
    const [
      incidentHeatmap,
      hospitalDistribution,
      responseTimeByRegion,
      riskLevelByRegion
    ] = await Promise.all([
      this.getIncidentHeatmap(dateFilter),
      this.getHospitalDistribution(),
      this.getResponseTimeByRegion(dateFilter),
      this.getRiskLevelByRegion(dateFilter)
    ]);

    this.logger.log('Geographic analytics generated');
    return {
      incidentHeatmap,
      hospitalDistribution,
      responseTimeByRegion,
      riskLevelByRegion,
      period: {
        startDate: query.startDate || 'All time',
        endDate: query.endDate || 'Present',
      },
    };
  }

  async getTrends(query: any) {
    this.logger.log('Generating trend analysis');
    
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);
    
    const [
      sosTrends,
      hospitalTrends,
      stockTrends,
      seasonalPatterns
    ] = await Promise.all([
      this.getSosTrends(dateFilter),
      this.getHospitalTrends(dateFilter),
      this.getStockTrends(),
      this.getSeasonalPatterns(dateFilter)
    ]);

    this.logger.log('Trend analysis generated');
    return {
      sosTrends,
      hospitalTrends,
      stockTrends,
      seasonalPatterns,
      period: {
        startDate: query.startDate || 'All time',
        endDate: query.endDate || 'Present',
      },
    };
  }

  async getImpactMetrics(query: any) {
    this.logger.log('Generating impact metrics');
    
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);
    
    const [
      livesSaved,
      responseTimeImprovement,
      hospitalCoverage,
      educationReach,
      systemReliability
    ] = await Promise.all([
      this.getLivesSaved(dateFilter),
      this.getResponseTimeImprovement(dateFilter),
      this.getHospitalCoverage(),
      this.getEducationReach(),
      this.getSystemReliability()
    ]);

    this.logger.log('Impact metrics generated');
    return {
      livesSaved,
      responseTimeImprovement,
      hospitalCoverage,
      educationReach,
      systemReliability,
      period: {
        startDate: query.startDate || 'All time',
        endDate: query.endDate || 'Present',
      },
    };
  }

  async logEvent(createAnalyticsLogDto: CreateAnalyticsLogDto) {
    this.logger.log(`Logging analytics event: ${createAnalyticsLogDto.eventType}`);
    
    const analyticsLog = await this.prisma.analyticsLog.create({
      data: createAnalyticsLogDto,
    });

    this.logger.log(`Analytics event logged with ID: ${analyticsLog.id}`);
    return analyticsLog;
  }

  // Helper methods for building analytics data
  private buildDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.createdAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      filter.createdAt = {
        lte: new Date(endDate),
      };
    }
    
    return filter;
  }

  private async getTotalSosReports(dateFilter: any) {
    return this.prisma.sOSReport.count({ where: dateFilter });
  }

  private async getActiveSosReports() {
    return this.prisma.sOSReport.count({
      where: {
        status: {
          in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'],
        },
      },
    });
  }

  private async getTotalHospitals() {
    return this.prisma.hospital.count();
  }

  private async getVerifiedHospitals() {
    return this.prisma.hospital.count({
      where: { verifiedStatus: 'VERIFIED' },
    });
  }

  private async getTotalStock() {
    const result = await this.prisma.stockUpdate.aggregate({
      _sum: { quantity: true },
      where: { status: 'AVAILABLE' },
    });
    return result._sum.quantity || 0;
  }

  private async getLowStockAlerts() {
    return this.prisma.stockUpdate.count({
      where: {
        status: 'AVAILABLE',
        quantity: { lt: 10 },
      },
    });
  }

  private async getEducationMaterials() {
    return this.prisma.educationMaterial.count({
      where: { isActive: true },
    });
  }

  private async getRecentActivity(dateFilter: any) {
    return this.prisma.analyticsLog.findMany({
      where: dateFilter,
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
  }

  private async getSosStatusDistribution(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['status'],
      _count: { id: true },
      where: dateFilter,
    });
  }

  private async getSosRiskLevelDistribution(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['snakeSpeciesId'],
      _count: { id: true },
      where: {
        ...dateFilter,
        snakeSpeciesId: { not: null },
      },
    });
  }

  private async getSosResponseTimeStats(dateFilter: any) {
    // This would need to be calculated based on status changes
    // For now, return placeholder data
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
    };
  }

  private async getSosGeographicDistribution(dateFilter: any) {
    // This would use PostGIS for geographic analysis
    // For now, return placeholder data
    return [];
  }

  private async getSosMonthlyTrends(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: dateFilter,
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getTopResponders(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['responderId'],
      _count: { id: true },
      where: dateFilter,
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  }

  private async getHospitalPerformance(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['hospitalId'],
      _count: { id: true },
      where: dateFilter,
      orderBy: { _count: { id: 'desc' } },
    });
  }

  private async getResponseTimeByHospital(dateFilter: any) {
    // Placeholder for response time calculation
    return [];
  }

  private async getAntivenomAvailability() {
    return this.prisma.stockUpdate.groupBy({
      by: ['antivenomType'],
      _sum: { quantity: true },
      where: { status: 'AVAILABLE' },
    });
  }

  private async getHospitalUtilization(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['hospitalId'],
      _count: { id: true },
      where: dateFilter,
    });
  }

  private async getTopPerformingHospitals(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['hospitalId'],
      _count: { id: true },
      where: {
        ...dateFilter,
        status: 'COMPLETED',
      },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  }

  private async getStockDistribution() {
    return this.prisma.stockUpdate.groupBy({
      by: ['status'],
      _count: { id: true },
    });
  }

  private async getExpiryAlerts() {
    return this.prisma.stockUpdate.count({
      where: {
        status: 'AVAILABLE',
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
    });
  }

  private async getStockTrends() {
    return this.prisma.stockUpdate.groupBy({
      by: ['lastUpdated'],
      _sum: { quantity: true },
      orderBy: { lastUpdated: 'asc' },
    });
  }

  private async getSupplierAnalysis() {
    return this.prisma.stockUpdate.groupBy({
      by: ['supplier'],
      _sum: { quantity: true },
      where: { supplier: { not: null } },
    });
  }

  private async getEducationCategoryDistribution() {
    return this.prisma.educationMaterial.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { isActive: true },
    });
  }

  private async getEducationLanguageDistribution() {
    return this.prisma.educationMaterial.groupBy({
      by: ['language'],
      _count: { id: true },
      where: { isActive: true },
    });
  }

  private async getEducationSourceDistribution() {
    return this.prisma.educationMaterial.groupBy({
      by: ['source'],
      _count: { id: true },
      where: { isActive: true },
    });
  }

  private async getMaterialUsage() {
    // This would track actual usage/views
    // For now, return placeholder data
    return [];
  }

  private async getTopMaterials() {
    return this.prisma.educationMaterial.findMany({
      where: { isActive: true },
      orderBy: { lastVerified: 'desc' },
      take: 10,
    });
  }

  private async getIncidentHeatmap(dateFilter: any) {
    // This would use PostGIS for geographic heatmap
    // For now, return placeholder data
    return [];
  }

  private async getHospitalDistribution() {
    return this.prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        coordinates: true,
        verifiedStatus: true,
      },
    });
  }

  private async getResponseTimeByRegion(dateFilter: any) {
    // Placeholder for regional response time analysis
    return [];
  }

  private async getRiskLevelByRegion(dateFilter: any) {
    // Placeholder for regional risk level analysis
    return [];
  }

  private async getSosTrends(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: dateFilter,
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getHospitalTrends(dateFilter: any) {
    return this.prisma.sOSReport.groupBy({
      by: ['hospitalId', 'createdAt'],
      _count: { id: true },
      where: dateFilter,
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getSeasonalPatterns(dateFilter: any) {
    // This would analyze seasonal patterns in snakebite incidents
    // For now, return placeholder data
    return [];
  }

  private async getLivesSaved(dateFilter: any) {
    // This would calculate estimated lives saved based on response time improvements
    // For now, return placeholder data
    return {
      estimated: 0,
      confidence: 'low',
    };
  }

  private async getResponseTimeImprovement(dateFilter: any) {
    // This would calculate response time improvements over time
    // For now, return placeholder data
    return {
      improvement: 0,
      baseline: 0,
      current: 0,
    };
  }

  private async getHospitalCoverage() {
    return {
      total: await this.prisma.hospital.count(),
      verified: await this.prisma.hospital.count({ where: { verifiedStatus: 'VERIFIED' } }),
      withAntivenom: await this.prisma.hospital.count({
        where: {
          verifiedStatus: 'VERIFIED',
          antivenomStock: { not: null },
        },
      }),
    };
  }

  private async getEducationReach() {
    return {
      totalMaterials: await this.prisma.educationMaterial.count({ where: { isActive: true } }),
      languages: await this.prisma.educationMaterial.groupBy({
        by: ['language'],
        _count: { id: true },
        where: { isActive: true },
      }),
      categories: await this.prisma.educationMaterial.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { isActive: true },
      }),
    };
  }

  private async getSystemReliability() {
    // This would calculate system uptime and reliability metrics
    // For now, return placeholder data
    return {
      uptime: 99.9,
      responseTime: 150,
      errorRate: 0.1,
    };
  }
}

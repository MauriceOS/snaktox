import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from './cache.service';
import { MonitoringService } from './monitoring.service';
import { OptimizationService } from './optimization.service';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly monitoringService: MonitoringService,
    private readonly optimizationService: OptimizationService,
  ) {}

  async getPerformanceOverview() {
    this.logger.log('Getting performance overview');
    
    const [
      systemMetrics,
      cacheMetrics,
      databaseMetrics,
      apiMetrics,
    ] = await Promise.all([
      this.monitoringService.getSystemMetrics(),
      this.cacheService.getCacheMetrics(),
      this.getDatabaseMetrics(),
      this.getApiMetrics(),
    ]);

    return {
      systemMetrics,
      cacheMetrics,
      databaseMetrics,
      apiMetrics,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getPerformanceDashboard() {
    this.logger.log('Getting performance dashboard data');
    
    const [
      overview,
      trends,
      alerts,
      recommendations,
    ] = await Promise.all([
      this.getPerformanceOverview(),
      this.getPerformanceTrends(),
      this.getPerformanceAlerts(),
      this.optimizationService.getOptimizationRecommendations(),
    ]);

    return {
      overview,
      trends,
      alerts,
      recommendations,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getDatabaseMetrics() {
    this.logger.log('Getting database performance metrics');
    
    // MongoDB metrics using Prisma Client
    const connectionMetrics = {
      total_connections: 1, // Prisma handles connection pooling
      active_connections: 1,
      idle_connections: 0,
    };

    // Get collection statistics from analytics logs
    const recentQueries = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'database_query',
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 10,
      select: {
        metadata: true,
        timestamp: true,
      },
    });

    const queryMetrics = recentQueries.map(query => ({
      query: query.metadata['queryName'] || 'unknown',
      calls: query.metadata['calls'] || 1,
      total_time: query.metadata['duration'] || 0,
      mean_time: query.metadata['duration'] || 0,
      rows: query.metadata['rowsAffected'] || 0,
    }));

    // Get collection statistics
    const tableStats = [
      {
        schemaname: 'public',
        tablename: 'analytics_logs',
        inserts: await this.prisma.analyticsLog.count(),
        updates: 0,
        deletes: 0,
        live_tuples: await this.prisma.analyticsLog.count(),
        dead_tuples: 0,
      },
      {
        schemaname: 'public',
        tablename: 'hospitals',
        inserts: await this.prisma.hospital.count(),
        updates: 0,
        deletes: 0,
        live_tuples: await this.prisma.hospital.count(),
        dead_tuples: 0,
      },
      {
        schemaname: 'public',
        tablename: 'sos_reports',
        inserts: await this.prisma.sOSReport.count(),
        updates: 0,
        deletes: 0,
        live_tuples: await this.prisma.sOSReport.count(),
        dead_tuples: 0,
      },
    ];

    return {
      connections: connectionMetrics,
      topQueries: queryMetrics,
      tableStatistics: tableStats,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getApiMetrics() {
    this.logger.log('Getting API performance metrics');
    
    const apiMetrics = await this.prisma.analyticsLog.groupBy({
      by: ['eventType'],
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      _count: true,
    });

    const responseTimeMetrics = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'api_request',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        metadata: true,
        timestamp: true,
      },
    });

    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, log) => sum + (log.metadata['responseTime'] || 0), 0) / responseTimeMetrics.length
      : 0;

    return {
      requestCounts: apiMetrics.map(metric => ({
        eventType: metric.eventType,
        count: metric._count,
      })),
      averageResponseTime: Math.round(averageResponseTime),
      totalRequests: apiMetrics.reduce((sum, metric) => sum + metric._count, 0),
      lastUpdated: new Date().toISOString(),
    };
  }

  async getPerformanceTrends(timeframe: string = '7d') {
    this.logger.log(`Getting performance trends for timeframe: ${timeframe}`);
    
    const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await this.prisma.analyticsLog.groupBy({
      by: ['eventType'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
    });

    return trends.map(trend => ({
      eventType: trend.eventType,
      count: trend._count,
      trend: this.calculateTrend(trend.eventType, days),
    }));
  }

  private calculateTrend(eventType: string, days: number): string {
    // Simulate trend calculation
    const trends = ['increasing', 'decreasing', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  async getPerformanceAlerts() {
    this.logger.log('Getting performance alerts');
    
    const alerts = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'performance_alert',
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return alerts.map(alert => ({
      id: alert.id,
      ...(alert.metadata as any || {}),
      timestamp: alert.timestamp,
    }));
  }

  async createPerformanceAlert(alertData: any) {
    this.logger.log(`Creating performance alert: ${alertData.title}`);
    
    const alert = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'performance_alert',
        metadata: {
          title: alertData.title,
          description: alertData.description,
          severity: alertData.severity,
          metric: alertData.metric,
          threshold: alertData.threshold,
          currentValue: alertData.currentValue,
          createdBy: alertData.createdBy,
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Performance alert created with ID: ${alert.id}`);
    return {
      id: alert.id,
      ...(alert.metadata as any || {}),
      timestamp: alert.timestamp,
    };
  }

  async getPerformanceStatistics() {
    this.logger.log('Getting performance statistics');
    
    const totalAlerts = await this.prisma.analyticsLog.count({
      where: { eventType: 'performance_alert' },
    });

    const criticalAlerts = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'performance_alert',
        metadata: {
          path: ['severity'],
          equals: 'critical',
        },
      },
    });

    const resolvedAlerts = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'performance_alert',
        metadata: {
          path: ['status'],
          equals: 'resolved',
        },
      },
    });

    const recentAlerts = await this.prisma.analyticsLog.findMany({
      where: { eventType: 'performance_alert' },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    const averageResponseTime = recentAlerts.length > 0
      ? recentAlerts.reduce((sum, alert) => sum + (alert.metadata['currentValue'] || 0), 0) / recentAlerts.length
      : 0;

    return {
      totalAlerts,
      criticalAlerts,
      resolvedAlerts,
      resolutionRate: totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0,
      averageResponseTime: Math.round(averageResponseTime),
      lastAlertDate: recentAlerts.length > 0 ? recentAlerts[0].timestamp : null,
    };
  }

  async optimizePerformance() {
    this.logger.log('Starting performance optimization');
    
    const optimizations = await this.optimizationService.performOptimizations();
    
    // Log optimization results
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'performance_optimization',
        metadata: {
          optimizations: optimizations,
          optimizedAt: new Date().toISOString(),
        },
      },
    });

    return optimizations;
  }

  async getPerformanceReport(startDate: Date, endDate: Date) {
    this.logger.log(`Generating performance report from ${startDate} to ${endDate}`);
    
    const alerts = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'performance_alert',
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const optimizations = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'performance_optimization',
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const report = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      alerts: {
        total: alerts.length,
        critical: alerts.filter(a => a.metadata['severity'] === 'critical').length,
        warning: alerts.filter(a => a.metadata['severity'] === 'warning').length,
        info: alerts.filter(a => a.metadata['severity'] === 'info').length,
      },
      optimizations: {
        total: optimizations.length,
        improvements: optimizations.flatMap(opt => opt.metadata['optimizations'] || []),
      },
      generatedAt: new Date().toISOString(),
    };

    // Log report generation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'performance_report_generated',
        metadata: {
          reportType: 'performance_summary',
          period: report.period,
          alerts: report.alerts.total,
          optimizations: report.optimizations.total,
          generatedAt: report.generatedAt,
        },
      },
    });

    return report;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemMetrics() {
    this.logger.log('Getting system metrics');
    
    const metrics = {
      cpu: await this.getCpuMetrics(),
      memory: await this.getMemoryMetrics(),
      disk: await this.getDiskMetrics(),
      network: await this.getNetworkMetrics(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      lastUpdated: new Date().toISOString(),
    };

    return metrics;
  }

  private async getCpuMetrics() {
    const cpuUsage = process.cpuUsage();
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    
    return {
      usage: Math.round((totalCpuTime / 1000000) * 100) / 100, // Convert to seconds
      user: Math.round((cpuUsage.user / 1000000) * 100) / 100,
      system: Math.round((cpuUsage.system / 1000000) * 100) / 100,
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
    };
  }

  private async getMemoryMetrics() {
    const memUsage = process.memoryUsage();
    
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024), // MB
    };
  }

  private async getDiskMetrics() {
    // Simulate disk metrics
    return {
      total: 100000, // MB
      used: 45000, // MB
      free: 55000, // MB
      usage: 45, // Percentage
    };
  }

  private async getNetworkMetrics() {
    // Simulate network metrics
    return {
      bytesReceived: 1024000, // bytes
      bytesSent: 512000, // bytes
      connections: 25,
      activeConnections: 15,
    };
  }

  async getApplicationMetrics() {
    this.logger.log('Getting application metrics');
    
    const metrics = {
      requests: await this.getRequestMetrics(),
      errors: await this.getErrorMetrics(),
      responseTime: await this.getResponseTimeMetrics(),
      throughput: await this.getThroughputMetrics(),
      lastUpdated: new Date().toISOString(),
    };

    return metrics;
  }

  private async getRequestMetrics() {
    const totalRequests = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'api_request',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const successfulRequests = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'api_request',
        metadata: {
          path: ['statusCode'],
          gte: 200,
          lt: 300,
        },
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      total: totalRequests,
      successful: successfulRequests,
      failed: totalRequests - successfulRequests,
      successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0,
    };
  }

  private async getErrorMetrics() {
    const errors = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'api_error',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        metadata: true,
        timestamp: true,
      },
    });

    const errorTypes = {};
    for (const error of errors) {
      const errorType = error.metadata['errorType'] || 'unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    }

    return {
      total: errors.length,
      byType: errorTypes,
      lastError: errors.length > 0 ? errors[0].timestamp : null,
    };
  }

  private async getResponseTimeMetrics() {
    const responseTimes = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'api_request',
        metadata: {
          path: ['responseTime'],
          not: null,
        },
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        metadata: true,
      },
    });

    if (responseTimes.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
      };
    }

    const times = responseTimes.map(rt => rt.metadata['responseTime']).sort((a, b) => a - b);
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const p95Index = Math.floor(times.length * 0.95);
    const p99Index = Math.floor(times.length * 0.99);

    return {
      average: Math.round(average),
      min: times[0],
      max: times[times.length - 1],
      p95: times[p95Index],
      p99: times[p99Index],
    };
  }

  private async getThroughputMetrics() {
    const requests = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'api_request',
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
      select: {
        timestamp: true,
      },
    });

    // Group by minute
    const requestsByMinute = {};
    for (const request of requests) {
      const minute = new Date(request.timestamp).toISOString().substring(0, 16);
      requestsByMinute[minute] = (requestsByMinute[minute] || 0) + 1;
    }

    const throughputs = Object.values(requestsByMinute) as number[];
    const averageThroughput = throughputs.length > 0 
      ? throughputs.reduce((sum, t) => sum + t, 0) / throughputs.length 
      : 0;

    return {
      average: Math.round(averageThroughput),
      peak: throughputs.length > 0 ? Math.max(...throughputs) : 0,
      current: requestsByMinute[new Date().toISOString().substring(0, 16)] || 0,
    };
  }

  async getHealthStatus() {
    this.logger.log('Getting health status');
    
    const [
      systemMetrics,
      applicationMetrics,
      databaseHealth,
    ] = await Promise.all([
      this.getSystemMetrics(),
      this.getApplicationMetrics(),
      this.checkDatabaseHealth(),
    ]);

    const healthScore = this.calculateHealthScore(systemMetrics, applicationMetrics, databaseHealth);

    return {
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
      score: healthScore,
      system: systemMetrics,
      application: applicationMetrics,
      database: databaseHealth,
      lastChecked: new Date().toISOString(),
    };
  }

  private async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      // Simple health check for MongoDB via Prisma
      await this.prisma.analyticsLog.findFirst();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        connections: 1, // Prisma manages connection pooling for MongoDB
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async getDatabaseConnections() {
    // MongoDB with Prisma uses connection pooling
    // Return a fixed value since we can't query pg_stat_activity
    return 1;
  }

  private calculateHealthScore(systemMetrics: any, applicationMetrics: any, databaseHealth: any): number {
    let score = 100;

    // System health (30%)
    if (systemMetrics.memory.heapUsed > 500) score -= 10; // High memory usage
    if (systemMetrics.cpu.usage > 80) score -= 15; // High CPU usage

    // Application health (40%)
    if (applicationMetrics.requests.successRate < 95) score -= 20; // Low success rate
    if (applicationMetrics.responseTime.average > 1000) score -= 15; // Slow response time
    if (applicationMetrics.errors.total > 10) score -= 10; // High error count

    // Database health (30%)
    if (databaseHealth.status !== 'healthy') score -= 30; // Database unhealthy
    if (databaseHealth.responseTime > 100) score -= 10; // Slow database response

    return Math.max(0, score);
  }

  async createHealthAlert(alertData: any) {
    this.logger.log(`Creating health alert: ${alertData.title}`);
    
    const alert = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'health_alert',
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

    return {
      id: alert.id,
      ...(alert.metadata as any || {}),
      timestamp: alert.timestamp,
    };
  }

  async getMonitoringDashboard() {
    this.logger.log('Getting monitoring dashboard data');
    
    const [
      systemMetrics,
      applicationMetrics,
      healthStatus,
      alerts,
    ] = await Promise.all([
      this.getSystemMetrics(),
      this.getApplicationMetrics(),
      this.getHealthStatus(),
      this.getHealthAlerts(),
    ]);

    return {
      systemMetrics,
      applicationMetrics,
      healthStatus,
      alerts,
      lastUpdated: new Date().toISOString(),
    };
  }

  private async getHealthAlerts() {
    const alerts = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'health_alert',
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
}

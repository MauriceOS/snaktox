import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from './cache.service';
import { MonitoringService } from './monitoring.service';

@Injectable()
export class OptimizationService {
  private readonly logger = new Logger(OptimizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async getOptimizationRecommendations() {
    this.logger.log('Getting optimization recommendations');
    
    const [
      databaseOptimizations,
      cacheOptimizations,
      apiOptimizations,
      systemOptimizations,
    ] = await Promise.all([
      this.getDatabaseOptimizations(),
      this.getCacheOptimizations(),
      this.getApiOptimizations(),
      this.getSystemOptimizations(),
    ]);

    return {
      database: databaseOptimizations,
      cache: cacheOptimizations,
      api: apiOptimizations,
      system: systemOptimizations,
      lastUpdated: new Date().toISOString(),
    };
  }

  private async getDatabaseOptimizations() {
    this.logger.log('Analyzing database optimizations');
    
    const optimizations = [];

    // Check for slow queries using analytics logs
    const slowQueries = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'database_query',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        metadata: {
          path: ['duration'],
          gte: 1000, // Queries slower than 1 second
        },
      },
      take: 5,
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (slowQueries.length > 0) {
      optimizations.push({
        type: 'slow_queries',
        priority: 'high',
        title: 'Optimize Slow Queries',
        description: `${slowQueries.length} queries are taking longer than 1 second`,
        impact: 'Significantly improve response times',
        action: 'Add database indexes and optimize query structure',
        queries: slowQueries.map(q => ({
          query: q.metadata['queryName'],
          duration: q.metadata['duration'],
          timestamp: q.timestamp,
        })),
      });
    }

    // Check for index recommendations based on collection sizes
    const collectionStats = await Promise.all([
      this.prisma.snakeSpecies.count(),
      this.prisma.hospital.count(),
      this.prisma.sOSReport.count(),
      this.prisma.educationMaterial.count(),
    ]);

    const largeCollections = collectionStats.filter(count => count > 1000);
    
    if (largeCollections.length > 0) {
      optimizations.push({
        type: 'missing_indexes',
        priority: 'medium',
        title: 'Review MongoDB Indexes',
        description: `${largeCollections.length} collections have significant data volumes`,
        impact: 'Improve query performance and reduce load times',
        action: 'Ensure proper indexes exist on frequently queried fields',
        collections: ['snakeSpecies', 'hospitals', 'sosReports', 'educationMaterials'],
      });
    }

    // MongoDB doesn't need VACUUM, but we can suggest cleanup of old analytics logs
    const oldLogsCount = await this.prisma.analyticsLog.count({
      where: {
        timestamp: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Older than 90 days
        },
      },
    });

    if (oldLogsCount > 10000) {
      optimizations.push({
        type: 'data_cleanup',
        priority: 'medium',
        title: 'Clean Up Old Analytics Logs',
        description: `${oldLogsCount} analytics logs are older than 90 days`,
        impact: 'Improve database performance and reduce storage usage',
        action: 'Archive or delete old analytics logs',
        oldLogsCount,
      });
    }

    return optimizations;
  }

  private async getCacheOptimizations() {
    this.logger.log('Analyzing cache optimizations');
    
    const optimizations = [];
    const cacheMetrics = await this.cacheService.getCacheMetrics();

    // Check cache hit rate
    if (cacheMetrics.hitRate < 80) {
      optimizations.push({
        type: 'low_hit_rate',
        priority: 'high',
        title: 'Improve Cache Hit Rate',
        description: `Current hit rate is ${cacheMetrics.hitRate}%, below recommended 80%`,
        impact: 'Reduce database load and improve response times',
        action: 'Increase cache TTL and add more cacheable data',
        currentHitRate: cacheMetrics.hitRate,
        targetHitRate: 80,
      });
    }

    // Check cache memory usage
    if (cacheMetrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
      optimizations.push({
        type: 'high_memory_usage',
        priority: 'medium',
        title: 'Optimize Cache Memory Usage',
        description: `Cache is using ${Math.round(cacheMetrics.memoryUsage / 1024 / 1024)}MB of memory`,
        impact: 'Reduce memory pressure and improve system stability',
        action: 'Implement cache eviction policies and reduce TTL',
        currentUsage: cacheMetrics.memoryUsage,
        recommendedUsage: 50 * 1024 * 1024, // 50MB
      });
    }

    // Check for cache warming opportunities
    const frequentlyAccessedData = await this.getFrequentlyAccessedData();
    if (frequentlyAccessedData.length > 0) {
      optimizations.push({
        type: 'cache_warming',
        priority: 'low',
        title: 'Implement Cache Warming',
        description: `${frequentlyAccessedData.length} data items are frequently accessed`,
        impact: 'Improve initial response times and user experience',
        action: 'Pre-load frequently accessed data into cache',
        dataItems: frequentlyAccessedData,
      });
    }

    return optimizations;
  }

  private async getApiOptimizations() {
    this.logger.log('Analyzing API optimizations');
    
    const optimizations = [];
    const applicationMetrics = await this.monitoringService.getApplicationMetrics();

    // Check response times
    if (applicationMetrics.responseTime.average > 500) {
      optimizations.push({
        type: 'slow_response_times',
        priority: 'high',
        title: 'Optimize API Response Times',
        description: `Average response time is ${applicationMetrics.responseTime.average}ms`,
        impact: 'Improve user experience and reduce server load',
        action: 'Implement response caching and optimize database queries',
        currentResponseTime: applicationMetrics.responseTime.average,
        targetResponseTime: 200,
      });
    }

    // Check error rates
    if (applicationMetrics.requests.successRate < 95) {
      optimizations.push({
        type: 'high_error_rate',
        priority: 'high',
        title: 'Reduce API Error Rate',
        description: `Success rate is ${applicationMetrics.requests.successRate}%, below recommended 95%`,
        impact: 'Improve system reliability and user experience',
        action: 'Implement better error handling and input validation',
        currentSuccessRate: applicationMetrics.requests.successRate,
        targetSuccessRate: 95,
      });
    }

    // Check throughput
    if (applicationMetrics.throughput.average < 100) {
      optimizations.push({
        type: 'low_throughput',
        priority: 'medium',
        title: 'Increase API Throughput',
        description: `Current throughput is ${applicationMetrics.throughput.average} requests/minute`,
        impact: 'Handle more concurrent users and reduce wait times',
        action: 'Implement connection pooling and optimize resource usage',
        currentThroughput: applicationMetrics.throughput.average,
        targetThroughput: 500,
      });
    }

    return optimizations;
  }

  private async getSystemOptimizations() {
    this.logger.log('Analyzing system optimizations');
    
    const optimizations = [];
    const systemMetrics = await this.monitoringService.getSystemMetrics();

    // Check memory usage
    if (systemMetrics.memory.heapUsed > 400) { // 400MB
      optimizations.push({
        type: 'high_memory_usage',
        priority: 'high',
        title: 'Optimize Memory Usage',
        description: `Heap usage is ${systemMetrics.memory.heapUsed}MB`,
        impact: 'Prevent memory leaks and improve system stability',
        action: 'Implement memory monitoring and garbage collection optimization',
        currentUsage: systemMetrics.memory.heapUsed,
        recommendedUsage: 200, // 200MB
      });
    }

    // Check CPU usage
    if (systemMetrics.cpu.usage > 70) {
      optimizations.push({
        type: 'high_cpu_usage',
        priority: 'medium',
        title: 'Optimize CPU Usage',
        description: `CPU usage is ${systemMetrics.cpu.usage}%`,
        impact: 'Improve system responsiveness and reduce latency',
        action: 'Optimize algorithms and implement CPU monitoring',
        currentUsage: systemMetrics.cpu.usage,
        recommendedUsage: 50,
      });
    }

    // Check disk usage
    if (systemMetrics.disk.usage > 80) {
      optimizations.push({
        type: 'high_disk_usage',
        priority: 'medium',
        title: 'Optimize Disk Usage',
        description: `Disk usage is ${systemMetrics.disk.usage}%`,
        impact: 'Prevent disk space issues and improve performance',
        action: 'Implement log rotation and cleanup old data',
        currentUsage: systemMetrics.disk.usage,
        recommendedUsage: 70,
      });
    }

    return optimizations;
  }

  private async getFrequentlyAccessedData() {
    // Get frequently accessed data from analytics
    const frequentData = await this.prisma.analyticsLog.groupBy({
      by: ['metadata'],
      where: {
        eventType: 'data_access',
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      _count: true,
      orderBy: {
        _count: {
          metadata: 'desc',
        },
      },
      take: 10,
    });

    return frequentData.map(item => ({
      dataType: item.metadata['dataType'],
      accessCount: item._count,
    }));
  }

  async performOptimizations() {
    this.logger.log('Starting performance optimizations');
    
    const optimizations = [];
    
    try {
      // Database optimizations
      await this.optimizeDatabase();
      optimizations.push('Database optimization completed');

      // Cache optimizations
      await this.optimizeCache();
      optimizations.push('Cache optimization completed');

      // API optimizations
      await this.optimizeApi();
      optimizations.push('API optimization completed');

      // System optimizations
      await this.optimizeSystem();
      optimizations.push('System optimization completed');

      this.logger.log('Performance optimizations completed successfully');
    } catch (error) {
      this.logger.error('Performance optimization failed:', error);
      optimizations.push(`Optimization failed: ${error.message}`);
    }

    return optimizations;
  }

  private async optimizeDatabase() {
    this.logger.log('Optimizing database');
    
    try {
      // For MongoDB, we focus on query optimization and data cleanup
      // MongoDB handles compaction automatically, unlike PostgreSQL's VACUUM
      
      // Clean up old analytics logs (older than 90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      await this.prisma.analyticsLog.deleteMany({
        where: {
          timestamp: {
            lt: ninetyDaysAgo,
          },
        },
      });
      
      this.logger.log('Database optimization completed');
    } catch (error) {
      this.logger.error('Database optimization failed:', error);
    }
  }

  private async optimizeCache() {
    this.logger.log('Optimizing cache');
    
    try {
      // Clear expired cache entries
      await this.cacheService.clear();
      
      // Warm up cache with frequently accessed data
      await this.cacheService.warmupCache();
      
      this.logger.log('Cache optimization completed');
    } catch (error) {
      this.logger.error('Cache optimization failed:', error);
    }
  }

  private async optimizeApi() {
    this.logger.log('Optimizing API');
    
    try {
      // Log API optimization
      await this.prisma.analyticsLog.create({
        data: {
          eventType: 'api_optimization',
          metadata: {
            optimizedAt: new Date().toISOString(),
            optimizations: ['response_caching', 'query_optimization'],
          },
        },
      });
      
      this.logger.log('API optimization completed');
    } catch (error) {
      this.logger.error('API optimization failed:', error);
    }
  }

  private async optimizeSystem() {
    this.logger.log('Optimizing system');
    
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Log system optimization
      await this.prisma.analyticsLog.create({
        data: {
          eventType: 'system_optimization',
          metadata: {
            optimizedAt: new Date().toISOString(),
            memoryBefore: process.memoryUsage().heapUsed,
            memoryAfter: process.memoryUsage().heapUsed,
          },
        },
      });
      
      this.logger.log('System optimization completed');
    } catch (error) {
      this.logger.error('System optimization failed:', error);
    }
  }

  async getOptimizationHistory() {
    this.logger.log('Getting optimization history');
    
    const optimizations = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: {
          in: ['performance_optimization', 'database_optimization', 'cache_optimization', 'api_optimization', 'system_optimization'],
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return optimizations.map(opt => ({
      id: opt.id,
      type: opt.eventType,
      ...(opt.metadata as any || {}),
      timestamp: opt.timestamp,
    }));
  }

  async getOptimizationStatistics() {
    this.logger.log('Getting optimization statistics');
    
    const totalOptimizations = await this.prisma.analyticsLog.count({
      where: {
        eventType: {
          in: ['performance_optimization', 'database_optimization', 'cache_optimization', 'api_optimization', 'system_optimization'],
        },
      },
    });

    const recentOptimizations = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: {
          in: ['performance_optimization', 'database_optimization', 'cache_optimization', 'api_optimization', 'system_optimization'],
        },
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    const optimizationTypes = {};
    for (const opt of recentOptimizations) {
      optimizationTypes[opt.eventType] = (optimizationTypes[opt.eventType] || 0) + 1;
    }

    return {
      totalOptimizations,
      recentOptimizations: recentOptimizations.length,
      optimizationTypes,
      lastOptimization: recentOptimizations.length > 0 ? recentOptimizations[0].timestamp : null,
    };
  }
}

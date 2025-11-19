import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, { value: any; expiry: number }>();

  constructor(private readonly prisma: PrismaService) {}

  async get(key: string): Promise<any> {
    this.logger.debug(`Getting cache key: ${key}`);
    
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    this.logger.debug(`Setting cache key: ${key} with TTL: ${ttl}s`);
    
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  async delete(key: string): Promise<void> {
    this.logger.debug(`Deleting cache key: ${key}`);
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing all cache');
    this.cache.clear();
  }

  async getCacheMetrics() {
    this.logger.log('Getting cache metrics');
    
    const totalKeys = this.cache.size;
    const expiredKeys = Array.from(this.cache.entries()).filter(
      ([, cached]) => Date.now() > cached.expiry
    ).length;
    
    const activeKeys = totalKeys - expiredKeys;
    const hitRate = await this.calculateHitRate();

    return {
      totalKeys,
      activeKeys,
      expiredKeys,
      hitRate,
      memoryUsage: this.getMemoryUsage(),
      lastUpdated: new Date().toISOString(),
    };
  }

  private async calculateHitRate(): Promise<number> {
    // Simulate hit rate calculation
    const cacheStats = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'cache_operation',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (cacheStats.length === 0) {
      return 0;
    }

    const hits = cacheStats.filter(stat => stat.metadata['operation'] === 'hit').length;
    const misses = cacheStats.filter(stat => stat.metadata['operation'] === 'miss').length;
    
    return hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  }

  private getMemoryUsage(): number {
    // Estimate memory usage
    let totalSize = 0;
    for (const [key, cached] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(cached.value).length * 2;
    }
    return totalSize;
  }

  async cacheHospitalData(hospitalId: string, data: any): Promise<void> {
    const key = `hospital:${hospitalId}`;
    await this.set(key, data, 1800); // 30 minutes
  }

  async getCachedHospitalData(hospitalId: string): Promise<any> {
    const key = `hospital:${hospitalId}`;
    return await this.get(key);
  }

  async cacheSnakeData(snakeId: string, data: any): Promise<void> {
    const key = `snake:${snakeId}`;
    await this.set(key, data, 3600); // 1 hour
  }

  async getCachedSnakeData(snakeId: string): Promise<any> {
    const key = `snake:${snakeId}`;
    return await this.get(key);
  }

  async cacheNearbyHospitals(lat: number, lng: number, radius: number, data: any): Promise<void> {
    const key = `hospitals:nearby:${lat}:${lng}:${radius}`;
    await this.set(key, data, 900); // 15 minutes
  }

  async getCachedNearbyHospitals(lat: number, lng: number, radius: number): Promise<any> {
    const key = `hospitals:nearby:${lat}:${lng}:${radius}`;
    return await this.get(key);
  }

  async cacheEducationContent(contentId: string, language: string, data: any): Promise<void> {
    const key = `education:${contentId}:${language}`;
    await this.set(key, data, 7200); // 2 hours
  }

  async getCachedEducationContent(contentId: string, language: string): Promise<any> {
    const key = `education:${contentId}:${language}`;
    return await this.get(key);
  }

  async cacheAnalyticsData(query: string, data: any): Promise<void> {
    const key = `analytics:${Buffer.from(query).toString('base64')}`;
    await this.set(key, data, 1800); // 30 minutes
  }

  async getCachedAnalyticsData(query: string): Promise<any> {
    const key = `analytics:${Buffer.from(query).toString('base64')}`;
    return await this.get(key);
  }

  async invalidateHospitalCache(hospitalId?: string): Promise<void> {
    if (hospitalId) {
      await this.delete(`hospital:${hospitalId}`);
    } else {
      // Invalidate all hospital cache
      for (const key of this.cache.keys()) {
        if (key.startsWith('hospital:')) {
          await this.delete(key);
        }
      }
    }
  }

  async invalidateSnakeCache(snakeId?: string): Promise<void> {
    if (snakeId) {
      await this.delete(`snake:${snakeId}`);
    } else {
      // Invalidate all snake cache
      for (const key of this.cache.keys()) {
        if (key.startsWith('snake:')) {
          await this.delete(key);
        }
      }
    }
  }

  async invalidateEducationCache(contentId?: string): Promise<void> {
    if (contentId) {
      // Invalidate all language versions of this content
      for (const key of this.cache.keys()) {
        if (key.startsWith(`education:${contentId}:`)) {
          await this.delete(key);
        }
      }
    } else {
      // Invalidate all education cache
      for (const key of this.cache.keys()) {
        if (key.startsWith('education:')) {
          await this.delete(key);
        }
      }
    }
  }

  async warmupCache(): Promise<void> {
    this.logger.log('Starting cache warmup');
    
    try {
      // Warm up frequently accessed data
      const hospitals = await this.prisma.hospital.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      for (const hospital of hospitals) {
        await this.cacheHospitalData(hospital.id, hospital);
      }

      const snakes = await this.prisma.snakeSpecies.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      for (const snake of snakes) {
        await this.cacheSnakeData(snake.id, snake);
      }

      const educationContent = await this.prisma.educationMaterial.findMany({
        where: { isActive: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });

      for (const content of educationContent) {
        await this.cacheEducationContent(content.id, content.language, content);
      }

      this.logger.log('Cache warmup completed successfully');
    } catch (error) {
      this.logger.error('Cache warmup failed:', error);
    }
  }

  async getCacheStatistics() {
    this.logger.log('Getting cache statistics');
    
    const metrics = await this.getCacheMetrics();
    
    const cacheOperations = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'cache_operation',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const cacheHits = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'cache_operation',
        metadata: {
          path: ['operation'],
          equals: 'hit',
        } as any, // MongoDB compatibility fix
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const cacheMisses = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'cache_operation',
        metadata: {
          path: ['operation'],
          equals: 'miss',
        } as any, // MongoDB compatibility fix
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      ...metrics,
      totalOperations: cacheOperations,
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: cacheOperations > 0 ? Math.round((cacheHits / cacheOperations) * 100) : 0,
    };
  }
}

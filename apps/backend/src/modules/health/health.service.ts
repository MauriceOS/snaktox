import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      // Check database connection using simple Prisma query
      await this.prisma.analyticsLog.findFirst();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: 'disconnected',
      };
    }
  }

  async ready() {
    try {
      // Check if all required services are ready
      await this.prisma.analyticsLog.findFirst();
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ready',
          api: 'ready',
        },
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: 'not ready',
          api: 'ready',
        },
      };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  
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

  async seedDatabase() {
    try {
      this.logger.log('Starting database seeding via API...');
      
      // Import and execute the seed script
      // The seed script is at the root level: prisma/seed.ts
      // From apps/backend, we need to go up two levels
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Determine the correct path based on where we're running from
      const seedScript = process.cwd().includes('apps/backend') 
        ? '../../prisma/seed.ts'
        : 'prisma/seed.ts';
      
      // Run the seed script using ts-node
      const { stdout, stderr } = await execAsync(
        `npx ts-node ${seedScript}`,
        { cwd: process.cwd() }
      );
      
      this.logger.log('Database seeding completed successfully');
      this.logger.log(stdout);
      
      if (stderr) {
        this.logger.warn('Seed warnings:', stderr);
      }
      
      return {
        status: 'success',
        message: 'Database seeded successfully',
        timestamp: new Date().toISOString(),
        output: stdout,
      };
    } catch (error) {
      this.logger.error('Database seeding failed:', error.message);
      return {
        status: 'error',
        message: 'Database seeding failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

import { Module } from '@nestjs/common';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { CacheService } from './cache.service';
import { MonitoringService } from './monitoring.service';
import { OptimizationService } from './optimization.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PerformanceController],
  providers: [
    PerformanceService,
    CacheService,
    MonitoringService,
    OptimizationService,
  ],
  exports: [
    PerformanceService,
    CacheService,
    MonitoringService,
    OptimizationService,
  ],
})
export class PerformanceModule {}

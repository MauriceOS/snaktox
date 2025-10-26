import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { HospitalModule } from './modules/hospital/hospital.module';
import { StockModule } from './modules/stock/stock.module';
import { SosModule } from './modules/sos/sos.module';
import { EducationModule } from './modules/education/education.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { ContentModule } from './modules/content/content.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AuthModule } from './modules/auth/auth.module';
import { RegionalModule } from './modules/regional/regional.module';
import { LocalizationModule } from './modules/localization/localization.module';
import { ComplianceModule } from './modules/compliance/compliance.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Common modules
    PrismaModule,
    LoggerModule,

    // Feature modules
    HealthModule,
    HospitalModule,
    StockModule,
    SosModule,
    EducationModule,
    AnalyticsModule,
    AiModule,
    NotificationsModule,
    WebSocketModule,
    ContentModule,
    CampaignsModule,
    AuthModule,
    RegionalModule,
    LocalizationModule,
    ComplianceModule,
    // PerformanceModule, // Temporarily commented out due to errors
  ],
})
export class AppModule {}

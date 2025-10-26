import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TwilioService } from './services/twilio.service';
import { AfricasTalkingService } from './services/africas-talking.service';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    TwilioService,
    AfricasTalkingService,
    EmailService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

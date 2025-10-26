import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 seconds timeout for AI service calls
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

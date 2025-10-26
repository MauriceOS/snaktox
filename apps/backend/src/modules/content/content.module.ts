import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { MediaService } from './media.service';
import { TranslationService } from './translation.service';

@Module({
  controllers: [ContentController],
  providers: [ContentService, MediaService, TranslationService],
  exports: [ContentService, MediaService, TranslationService],
})
export class ContentModule {}

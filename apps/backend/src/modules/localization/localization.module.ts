import { Module } from '@nestjs/common';
import { LocalizationController } from './localization.controller';
import { LocalizationService } from './localization.service';
import { TranslationService } from './translation.service';
import { LanguageDetectionService } from './language-detection.service';
import { ContentLocalizationService } from './content-localization.service';
import { RegionalModule } from '../regional/regional.module';

@Module({
  imports: [RegionalModule],
  controllers: [LocalizationController],
  providers: [
    LocalizationService,
    TranslationService,
    LanguageDetectionService,
    ContentLocalizationService,
  ],
  exports: [
    LocalizationService,
    TranslationService,
    LanguageDetectionService,
    ContentLocalizationService,
  ],
})
export class LocalizationModule {}

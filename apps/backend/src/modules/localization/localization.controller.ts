import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LocalizationService } from './localization.service';
import { TranslationService } from './translation.service';
import { LanguageDetectionService } from './language-detection.service';
import { ContentLocalizationService } from './content-localization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('localization')
export class LocalizationController {
  constructor(
    private readonly localizationService: LocalizationService,
    private readonly translationService: TranslationService,
    private readonly languageDetectionService: LanguageDetectionService,
    private readonly contentLocalizationService: ContentLocalizationService,
  ) {}

  @Get('overview')
  async getLocalizationOverview() {
    return this.localizationService.getLocalizationOverview();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async getLocalizationDashboard() {
    return this.localizationService.getLocalizationDashboard();
  }

  @Get('statistics')
  async getLocalizationStatistics() {
    return this.localizationService.getLocalizationStatistics();
  }

  @Get('quality-metrics')
  async getLocalizationQualityMetrics() {
    return this.localizationService.getLocalizationQualityMetrics();
  }

  @Get('content/:contentId/:language')
  async getLocalizedContent(
    @Param('contentId') contentId: string,
    @Param('language') language: string,
  ) {
    return this.localizationService.getLocalizedContent(contentId, language);
  }

  @Post('content/:contentId/localize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async localizeContent(
    @Param('contentId') contentId: string,
    @Body() localizationData: { targetLanguage: string },
    @Query('userId') userId?: string,
  ) {
    return this.localizationService.localizeContent(
      contentId,
      localizationData.targetLanguage,
      userId,
    );
  }

  @Post('content/batch-localize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async batchLocalizeContent(
    @Body() batchData: { contentIds: string[]; targetLanguage: string },
    @Query('userId') userId?: string,
  ) {
    return this.localizationService.batchLocalizeContent(
      batchData.contentIds,
      batchData.targetLanguage,
      userId,
    );
  }

  @Get('content/user-language/:contentId')
  async getContentInUserLanguage(
    @Param('contentId') contentId: string,
    @Query() userPreferences: any,
  ) {
    return this.localizationService.getContentInUserLanguage(contentId, userPreferences);
  }

  // Translation endpoints
  @Get('languages')
  async getSupportedLanguages() {
    return this.translationService.getSupportedLanguages();
  }

  @Get('languages/active')
  async getActiveLanguages() {
    return this.translationService.getActiveLanguages();
  }

  @Get('languages/coverage')
  async getTranslationCoverage() {
    return this.translationService.getTranslationCoverage();
  }

  @Get('languages/quality-metrics')
  async getTranslationQualityMetrics() {
    return this.translationService.getTranslationQualityMetrics();
  }

  @Post('languages/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async validateTranslation(
    @Body() validationData: { contentId: string; language: string },
    @Query('userId') userId: string,
  ) {
    return this.translationService.validateTranslation(
      validationData.contentId,
      validationData.language,
      userId,
    );
  }

  // Language detection endpoints
  @Post('detect-language')
  async detectUserLanguage(@Body() userPreferences: any) {
    return this.languageDetectionService.detectUserLanguage(userPreferences);
  }

  @Post('detect-text-language')
  async detectLanguageFromText(@Body() textData: { text: string }) {
    return this.languageDetectionService.detectLanguageFromText(textData.text);
  }

  @Get('detect-confidence')
  async getLanguageConfidence(
    @Query('text') text: string,
    @Query('language') language: string,
  ) {
    return this.languageDetectionService.getLanguageConfidence(text, language);
  }

  @Get('languages/info/:languageCode')
  async getLanguageInfo(@Param('languageCode') languageCode: string) {
    return this.languageDetectionService.getLanguageInfo(languageCode);
  }

  // Content localization endpoints
  @Get('content/statistics')
  async getContentStatistics() {
    return this.contentLocalizationService.getContentStatistics();
  }

  @Get('content/language/:language')
  async getContentByLanguage(
    @Param('language') language: string,
    @Query('category') category?: string,
  ) {
    return this.contentLocalizationService.getContentByLanguage(language, category);
  }

  @Get('content/gaps')
  async getContentGaps() {
    return this.contentLocalizationService.getContentGaps();
  }

  @Get('content/priorities')
  async prioritizeContentForTranslation() {
    return this.contentLocalizationService.prioritizeContentForTranslation();
  }

  @Get('content/progress')
  async getLocalizationProgress() {
    return this.contentLocalizationService.getLocalizationProgress();
  }

  @Get('content/quality')
  async getContentQualityMetrics() {
    return this.contentLocalizationService.getContentQualityMetrics();
  }

  @Get('content/recommendations')
  async getLocalizationRecommendations() {
    return this.contentLocalizationService.getLocalizationRecommendations();
  }

  @Get('content/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async getContentLocalizationDashboard() {
    return this.contentLocalizationService.getLocalizationDashboard();
  }
}

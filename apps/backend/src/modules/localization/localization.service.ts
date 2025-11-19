import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TranslationService } from './translation.service';
import { LanguageDetectionService } from './language-detection.service';
import { ContentLocalizationService } from './content-localization.service';

@Injectable()
export class LocalizationService {
  private readonly logger = new Logger(LocalizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly languageDetectionService: LanguageDetectionService,
    private readonly contentLocalizationService: ContentLocalizationService,
  ) {}

  async getLocalizationOverview() {
    this.logger.log('Getting localization overview');
    
    const supportedLanguages = await this.translationService.getSupportedLanguages();
    const activeLanguages = await this.translationService.getActiveLanguages();
    const translationCoverage = await this.translationService.getTranslationCoverage();
    const contentStats = await this.contentLocalizationService.getContentStatistics();
    
    return {
      supportedLanguages,
      activeLanguages,
      translationCoverage,
      contentStatistics: contentStats,
      lastUpdated: new Date().toISOString(),
    };
  }

  async localizeContent(contentId: string, targetLanguage: string, userId?: string) {
    this.logger.log(`Localizing content ${contentId} to ${targetLanguage}`);
    
    // Get original content
    const originalContent = await this.prisma.educationMaterial.findUnique({
      where: { id: contentId },
    });

    if (!originalContent) {
      throw new Error(`Content with ID ${contentId} not found`);
    }

    // Check if translation already exists
    const existingTranslation = await this.prisma.educationMaterial.findFirst({
      where: {
        title: originalContent.title,
        category: originalContent.category,
        language: targetLanguage,
        isActive: true,
      },
    });

    if (existingTranslation) {
      this.logger.log(`Translation already exists for content ${contentId} in ${targetLanguage}`);
      return existingTranslation;
    }

    // Generate translation
    const translation = await this.translationService.translateContent(
      originalContent,
      targetLanguage,
    );

    // Create localized content
    const localizedContent = await this.prisma.educationMaterial.create({
      data: {
        title: translation.title,
        content: translation.content,
        category: originalContent.category,
        language: targetLanguage,
        source: originalContent.source,
        author: translation.translator || 'SnaKTox Translation Service',
        isActive: true,
        metadata: {
          originalContentId: contentId,
          translatedAt: new Date().toISOString(),
          translatedBy: userId || 'system',
          translationMethod: 'automated',
          confidence: translation.confidence,
        },
      },
    });

    // Log localization
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'content_localized',
        userId,
        metadata: {
          contentId,
          originalLanguage: originalContent.language,
          targetLanguage,
          translationId: localizedContent.id,
          confidence: translation.confidence,
          localizedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Content ${contentId} localized to ${targetLanguage} with ID: ${localizedContent.id}`);
    return localizedContent;
  }

  async getLocalizedContent(contentId: string, language: string) {
    this.logger.log(`Getting localized content ${contentId} in ${language}`);
    
    // Try to find content in requested language
    let content = await this.prisma.educationMaterial.findFirst({
      where: {
        id: contentId,
        language,
        isActive: true,
      },
    });

    // If not found, try to find original content
    if (!content) {
      content = await this.prisma.educationMaterial.findUnique({
        where: { id: contentId },
      });
    }

    if (!content) {
      throw new Error(`Content with ID ${contentId} not found`);
    }

    // If content is not in requested language, attempt auto-translation
    if (content.language !== language) {
      this.logger.log(`Content not available in ${language}, attempting auto-translation`);
      
      try {
        const translatedContent = await this.localizeContent(contentId, language);
        return translatedContent;
      } catch (error) {
        this.logger.warn(`Auto-translation failed for content ${contentId} to ${language}: ${error.message}`);
        // Return original content as fallback
        return content;
      }
    }

    return content;
  }

  async getContentInUserLanguage(contentId: string, userPreferences: any) {
    this.logger.log(`Getting content ${contentId} in user's preferred language`);
    
    const preferredLanguage = await this.languageDetectionService.detectUserLanguage(userPreferences);
    
    return this.getLocalizedContent(contentId, preferredLanguage);
  }

  async batchLocalizeContent(contentIds: string[], targetLanguage: string, userId?: string) {
    this.logger.log(`Batch localizing ${contentIds.length} content items to ${targetLanguage}`);
    
    const results = [];
    const errors = [];

    for (const contentId of contentIds) {
      try {
        const localizedContent = await this.localizeContent(contentId, targetLanguage, userId);
        results.push(localizedContent);
      } catch (error) {
        this.logger.error(`Failed to localize content ${contentId}: ${error.message}`);
        errors.push({
          contentId,
          error: error.message,
        });
      }
    }

    // Log batch localization
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'batch_localization',
        userId,
        metadata: {
          targetLanguage,
          totalItems: contentIds.length,
          successful: results.length,
          failed: errors.length,
          errors,
          completedAt: new Date().toISOString(),
        },
      },
    });

    return {
      successful: results,
      failed: errors,
      summary: {
        total: contentIds.length,
        successful: results.length,
        failed: errors.length,
        successRate: Math.round((results.length / contentIds.length) * 100),
      },
    };
  }

  async getLocalizationStatistics() {
    this.logger.log('Getting localization statistics');
    
    const totalContent = await this.prisma.educationMaterial.count();
    const contentByLanguage = await this.prisma.educationMaterial.groupBy({
      by: ['language'],
      _count: true,
    });

    const translationRequests = await this.prisma.analyticsLog.count({
      where: { eventType: 'content_localized' },
    });

    const batchLocalizations = await this.prisma.analyticsLog.count({
      where: { eventType: 'batch_localization' },
    });

    const languageUsage = await this.getLanguageUsageStatistics();

    return {
      totalContent,
      contentByLanguage: contentByLanguage.map(item => ({
        language: item.language,
        count: item._count,
      })),
      translationRequests,
      batchLocalizations,
      languageUsage,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getLanguageUsageStatistics() {
    this.logger.log('Getting language usage statistics');
    
    const usage = await this.prisma.analyticsLog.groupBy({
      by: ['metadata'],
      where: {
        eventType: 'language_selection',
      },
      _count: true,
    });

    const languageUsage = {};
    for (const item of usage) {
      const languageCode = item.metadata['languageCode'];
      if (languageCode) {
        languageUsage[languageCode] = item._count;
      }
    }

    return languageUsage;
  }

  async getLocalizationQualityMetrics() {
    this.logger.log('Getting localization quality metrics');
    
    const translations = await this.prisma.educationMaterial.findMany({
      where: {
        metadata: {
          path: ['translationMethod'],
          equals: 'automated',
        } as any, // MongoDB compatibility fix
      },
      select: {
        id: true,
        language: true,
        metadata: true,
      },
    });

    const qualityMetrics = {
      totalTranslations: translations.length,
      averageConfidence: 0,
      confidenceDistribution: {},
      languageQuality: {},
    };

    if (translations.length > 0) {
      let totalConfidence = 0;
      const confidenceByLanguage = {};

      for (const translation of translations) {
        const confidence = translation.metadata['confidence'] || 0;
        totalConfidence += confidence;

        if (!confidenceByLanguage[translation.language]) {
          confidenceByLanguage[translation.language] = [];
        }
        confidenceByLanguage[translation.language].push(confidence);
      }

      qualityMetrics.averageConfidence = Math.round((totalConfidence / translations.length) * 100) / 100;

      // Calculate confidence distribution
      const confidenceRanges = {
        '90-100%': 0,
        '80-89%': 0,
        '70-79%': 0,
        '60-69%': 0,
        'Below 60%': 0,
      };

      for (const translation of translations) {
        const confidence = translation.metadata['confidence'] || 0;
        if (confidence >= 0.9) confidenceRanges['90-100%']++;
        else if (confidence >= 0.8) confidenceRanges['80-89%']++;
        else if (confidence >= 0.7) confidenceRanges['70-79%']++;
        else if (confidence >= 0.6) confidenceRanges['60-69%']++;
        else confidenceRanges['Below 60%']++;
      }

      qualityMetrics.confidenceDistribution = confidenceRanges;

      // Calculate average confidence by language
      for (const [language, confidences] of Object.entries(confidenceByLanguage)) {
        const typedConfidences = confidences as number[];
        const avgConfidence = typedConfidences.reduce((sum, conf) => sum + conf, 0) / typedConfidences.length;
        qualityMetrics.languageQuality[language] = Math.round(avgConfidence * 100) / 100;
      }
    }

    return qualityMetrics;
  }

  async getLocalizationDashboard() {
    this.logger.log('Getting localization dashboard data');
    
    const [
      overview,
      statistics,
      qualityMetrics,
    ] = await Promise.all([
      this.getLocalizationOverview(),
      this.getLocalizationStatistics(),
      this.getLocalizationQualityMetrics(),
    ]);

    return {
      overview,
      statistics,
      qualityMetrics,
      lastUpdated: new Date().toISOString(),
    };
  }
}

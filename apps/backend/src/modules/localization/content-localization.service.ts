import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TranslationService } from './translation.service';
import { LanguageDetectionService } from './language-detection.service';

@Injectable()
export class ContentLocalizationService {
  private readonly logger = new Logger(ContentLocalizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly languageDetectionService: LanguageDetectionService,
  ) {}

  async getContentStatistics() {
    this.logger.log('Getting content localization statistics');
    
    const totalContent = await this.prisma.educationMaterial.count({
      where: { isActive: true },
    });

    const contentByLanguage = await this.prisma.educationMaterial.groupBy({
      by: ['language'],
      where: { isActive: true },
      _count: true,
    });

    const contentByCategory = await this.prisma.educationMaterial.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true,
    });

    const translatedContent = await this.prisma.educationMaterial.count({
      where: {
        isActive: true,
        metadata: {
          path: ['translationMethod'],
          equals: 'automated',
        },
      },
    });

    return {
      totalContent,
      contentByLanguage: contentByLanguage.map(item => ({
        language: item.language,
        count: item._count,
      })),
      contentByCategory: contentByCategory.map(item => ({
        category: item.category,
        count: item._count,
      })),
      translatedContent,
      translationRate: totalContent > 0 ? Math.round((translatedContent / totalContent) * 100) : 0,
    };
  }

  async getContentByLanguage(language: string, category?: string) {
    this.logger.log(`Getting content for language: ${language}, category: ${category}`);
    
    const where: any = {
      language,
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    const content = await this.prisma.educationMaterial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return content;
  }

  async getContentGaps() {
    this.logger.log('Getting content gaps across languages');
    
    const supportedLanguages = await this.translationService.getSupportedLanguages();
    const contentByLanguage = await this.prisma.educationMaterial.groupBy({
      by: ['language', 'category'],
      where: { isActive: true },
      _count: true,
    });

    const gaps = [];
    
    for (const language of supportedLanguages) {
      const languageContent = contentByLanguage.filter(item => item.language === language.code);
      const categories = ['prevention', 'first_aid', 'treatment', 'awareness', 'emergency'];
      
      for (const category of categories) {
        const categoryContent = languageContent.find(item => item.category === category);
        if (!categoryContent || categoryContent._count === 0) {
          gaps.push({
            language: language.code,
            languageName: language.name,
            category,
            missing: true,
          });
        }
      }
    }

    return gaps;
  }

  async prioritizeContentForTranslation() {
    this.logger.log('Prioritizing content for translation');
    
    const gaps = await this.getContentGaps();
    const priorityContent = [];

    // Prioritize emergency and first_aid content
    const highPriorityCategories = ['emergency', 'first_aid'];
    const mediumPriorityCategories = ['treatment', 'prevention'];
    const lowPriorityCategories = ['awareness'];

    for (const gap of gaps) {
      let priority = 'low';
      
      if (highPriorityCategories.includes(gap.category)) {
        priority = 'high';
      } else if (mediumPriorityCategories.includes(gap.category)) {
        priority = 'medium';
      }

      priorityContent.push({
        ...gap,
        priority,
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    priorityContent.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return priorityContent;
  }

  async getLocalizationProgress() {
    this.logger.log('Getting localization progress');
    
    const supportedLanguages = await this.translationService.getSupportedLanguages();
    const progress = [];

    for (const language of supportedLanguages) {
      const contentCount = await this.prisma.educationMaterial.count({
        where: {
          language: language.code,
          isActive: true,
        },
      });

      const totalCategories = 5; // prevention, first_aid, treatment, awareness, emergency
      const categoriesWithContent = await this.prisma.educationMaterial.groupBy({
        by: ['category'],
        where: {
          language: language.code,
          isActive: true,
        },
      });

      const progressPercentage = Math.round((categoriesWithContent.length / totalCategories) * 100);

      progress.push({
        language: language.code,
        languageName: language.name,
        contentCount,
        categoriesWithContent: categoriesWithContent.length,
        totalCategories,
        progressPercentage,
        status: progressPercentage === 100 ? 'complete' : progressPercentage >= 80 ? 'near_complete' : 'in_progress',
      });
    }

    return progress;
  }

  async getContentQualityMetrics() {
    this.logger.log('Getting content quality metrics');
    
    const translations = await this.prisma.educationMaterial.findMany({
      where: {
        metadata: {
          path: ['translationMethod'],
          equals: 'automated',
        },
        isActive: true,
      },
      select: {
        id: true,
        language: true,
        category: true,
        metadata: true,
      },
    });

    const qualityMetrics = {
      totalTranslations: translations.length,
      averageConfidence: 0,
      confidenceByLanguage: {},
      confidenceByCategory: {},
      qualityDistribution: {
        high: 0,
        medium: 0,
        low: 0,
      },
    };

    if (translations.length > 0) {
      let totalConfidence = 0;

      for (const translation of translations) {
        const confidence = translation.metadata['confidence'] || 0;
        totalConfidence += confidence;

        // Group by language
        if (!qualityMetrics.confidenceByLanguage[translation.language]) {
          qualityMetrics.confidenceByLanguage[translation.language] = {
            count: 0,
            totalConfidence: 0,
          };
        }
        qualityMetrics.confidenceByLanguage[translation.language].count++;
        qualityMetrics.confidenceByLanguage[translation.language].totalConfidence += confidence;

        // Group by category
        if (!qualityMetrics.confidenceByCategory[translation.category]) {
          qualityMetrics.confidenceByCategory[translation.category] = {
            count: 0,
            totalConfidence: 0,
          };
        }
        qualityMetrics.confidenceByCategory[translation.category].count++;
        qualityMetrics.confidenceByCategory[translation.category].totalConfidence += confidence;

        // Quality distribution
        if (confidence >= 0.9) {
          qualityMetrics.qualityDistribution.high++;
        } else if (confidence >= 0.7) {
          qualityMetrics.qualityDistribution.medium++;
        } else {
          qualityMetrics.qualityDistribution.low++;
        }
      }

      qualityMetrics.averageConfidence = Math.round((totalConfidence / translations.length) * 100) / 100;

      // Calculate average confidence by language
      for (const [language, data] of Object.entries(qualityMetrics.confidenceByLanguage)) {
        const typedData = data as any;
        typedData.averageConfidence = Math.round((typedData.totalConfidence / typedData.count) * 100) / 100;
      }

      // Calculate average confidence by category
      for (const [category, data] of Object.entries(qualityMetrics.confidenceByCategory)) {
        const typedData = data as any;
        typedData.averageConfidence = Math.round((typedData.totalConfidence / typedData.count) * 100) / 100;
      }
    }

    return qualityMetrics;
  }

  async getLocalizationRecommendations() {
    this.logger.log('Getting localization recommendations');
    
    const recommendations = [];
    
    // Get content gaps
    const gaps = await this.getContentGaps();
    
    // Get quality metrics
    const qualityMetrics = await this.getContentQualityMetrics();
    
    // Get progress
    const progress = await this.getLocalizationProgress();

    // Recommendation 1: Fill content gaps
    if (gaps.length > 0) {
      recommendations.push({
        type: 'content_gap',
        priority: 'high',
        title: 'Fill Content Gaps',
        description: `There are ${gaps.length} content gaps across languages and categories`,
        action: 'Translate missing content for critical categories',
        impact: 'Improve user experience and emergency response',
      });
    }

    // Recommendation 2: Improve translation quality
    if (qualityMetrics.averageConfidence < 0.8) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'medium',
        title: 'Improve Translation Quality',
        description: `Average translation confidence is ${Math.round(qualityMetrics.averageConfidence * 100)}%`,
        action: 'Review and improve low-confidence translations',
        impact: 'Increase content accuracy and user trust',
      });
    }

    // Recommendation 3: Complete language coverage
    const incompleteLanguages = progress.filter(p => p.progressPercentage < 100);
    if (incompleteLanguages.length > 0) {
      recommendations.push({
        type: 'language_completion',
        priority: 'medium',
        title: 'Complete Language Coverage',
        description: `${incompleteLanguages.length} languages have incomplete content coverage`,
        action: 'Complete missing content for all supported languages',
        impact: 'Ensure equal access across all user groups',
      });
    }

    // Recommendation 4: Add new languages
    const activeLanguages = progress.filter(p => p.progressPercentage > 0);
    if (activeLanguages.length < 6) {
      recommendations.push({
        type: 'language_expansion',
        priority: 'low',
        title: 'Expand Language Support',
        description: 'Consider adding support for additional regional languages',
        action: 'Research and add support for new languages',
        impact: 'Reach more users in underserved communities',
      });
    }

    return recommendations;
  }

  async getLocalizationDashboard() {
    this.logger.log('Getting localization dashboard data');
    
    const [
      statistics,
      progress,
      qualityMetrics,
      recommendations,
      priorityContent,
    ] = await Promise.all([
      this.getContentStatistics(),
      this.getLocalizationProgress(),
      this.getContentQualityMetrics(),
      this.getLocalizationRecommendations(),
      this.prioritizeContentForTranslation(),
    ]);

    return {
      statistics,
      progress,
      qualityMetrics,
      recommendations,
      priorityContent: priorityContent.slice(0, 10), // Top 10 priorities
      lastUpdated: new Date().toISOString(),
    };
  }
}

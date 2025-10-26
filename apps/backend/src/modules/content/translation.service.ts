import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTranslationDto } from './dto/create-translation.dto';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  // Supported languages for SnaKTox
  private readonly supportedLanguages = {
    en: 'English',
    sw: 'Kiswahili',
    fr: 'Français',
    ar: 'العربية',
    am: 'አማርኛ', // Amharic
    ha: 'Hausa',
    yo: 'Yoruba',
    ig: 'Igbo',
    zu: 'Zulu',
    xh: 'Xhosa',
  };

  constructor(private readonly prisma: PrismaService) {}

  async createTranslation(createTranslationDto: CreateTranslationDto) {
    this.logger.log(`Creating translation for content: ${createTranslationDto.contentId}`);
    
    // Verify the original content exists
    const originalContent = await this.prisma.educationMaterial.findUnique({
      where: { id: createTranslationDto.contentId },
    });

    if (!originalContent) {
      throw new Error('Original content not found');
    }

    // Check if translation already exists
    const existingTranslation = await this.prisma.educationMaterial.findFirst({
      where: {
        title: originalContent.title,
        language: createTranslationDto.language,
        category: originalContent.category,
      },
    });

    if (existingTranslation) {
      // Update existing translation
      const translation = await this.prisma.educationMaterial.update({
        where: { id: existingTranslation.id },
        data: {
          content: createTranslationDto.content,
          author: createTranslationDto.translator,
          lastVerified: new Date(),
        },
      });

      this.logger.log(`Translation updated: ${translation.id}`);
      return translation;
    } else {
      // Create new translation
      const translation = await this.prisma.educationMaterial.create({
        data: {
          title: originalContent.title,
          content: createTranslationDto.content,
          category: originalContent.category,
          language: createTranslationDto.language,
          source: originalContent.source,
          author: createTranslationDto.translator,
          isActive: true,
        },
      });

      this.logger.log(`Translation created: ${translation.id}`);
      return translation;
    }
  }

  async getTranslations(contentId: string) {
    this.logger.log(`Getting translations for content: ${contentId}`);
    
    const originalContent = await this.prisma.educationMaterial.findUnique({
      where: { id: contentId },
    });

    if (!originalContent) {
      throw new Error('Original content not found');
    }

    const translations = await this.prisma.educationMaterial.findMany({
      where: {
        title: originalContent.title,
        category: originalContent.category,
      },
      orderBy: { language: 'asc' },
    });

    return translations;
  }

  async getContentInLanguage(contentId: string, language: string) {
    this.logger.log(`Getting content in language: ${language}`);
    
    const originalContent = await this.prisma.educationMaterial.findUnique({
      where: { id: contentId },
    });

    if (!originalContent) {
      throw new Error('Original content not found');
    }

    // Try to find translation
    const translation = await this.prisma.educationMaterial.findFirst({
      where: {
        title: originalContent.title,
        category: originalContent.category,
        language,
        isActive: true,
      },
    });

    if (translation) {
      return translation;
    }

    // If no translation exists, return original content
    this.logger.warn(`No translation found for language: ${language}, returning original content`);
    return originalContent;
  }

  async getSupportedLanguages() {
    this.logger.log('Getting supported languages');
    return this.supportedLanguages;
  }

  async getLanguageStatistics() {
    this.logger.log('Getting language statistics');
    
    const languageStats = await this.prisma.educationMaterial.groupBy({
      by: ['language'],
      _count: true,
      where: { isActive: true },
    });

    return languageStats.map(stat => ({
      language: stat.language,
      languageName: this.supportedLanguages[stat.language] || stat.language,
      count: stat._count,
    }));
  }

  async getMissingTranslations() {
    this.logger.log('Getting missing translations');
    
    // Get all unique content titles and categories
    const uniqueContent = await this.prisma.educationMaterial.findMany({
      select: { title: true, category: true },
      distinct: ['title', 'category'],
      where: { isActive: true },
    });

    const missingTranslations = [];

    for (const content of uniqueContent) {
      const existingLanguages = await this.prisma.educationMaterial.findMany({
        select: { language: true },
        where: {
          title: content.title,
          category: content.category,
          isActive: true,
        },
      });

      const existingLanguageCodes = existingLanguages.map(lang => lang.language);
      const missingLanguages = Object.keys(this.supportedLanguages).filter(
        lang => !existingLanguageCodes.includes(lang)
      );

      if (missingLanguages.length > 0) {
        missingTranslations.push({
          title: content.title,
          category: content.category,
          missingLanguages: missingLanguages.map(lang => ({
            code: lang,
            name: this.supportedLanguages[lang],
          })),
        });
      }
    }

    return missingTranslations;
  }

  async validateTranslation(content: string, language: string): Promise<boolean> {
    this.logger.log(`Validating translation for language: ${language}`);
    
    // Basic validation - check if content is not empty
    if (!content || content.trim().length === 0) {
      return false;
    }

    // Language-specific validation could be added here
    // For example, checking for proper character sets, length ratios, etc.
    
    return true;
  }

  async getTranslationProgress() {
    this.logger.log('Getting translation progress');
    
    const totalContent = await this.prisma.educationMaterial.count({
      where: { isActive: true },
    });

    const languageStats = await this.getLanguageStatistics();
    const totalLanguages = Object.keys(this.supportedLanguages).length;
    
    const progress = languageStats.map(stat => ({
      language: stat.language,
      languageName: stat.languageName,
      count: stat.count,
      percentage: Math.round((stat.count / totalContent) * 100),
    }));

    return {
      totalContent,
      totalLanguages,
      progress,
      overallProgress: Math.round(
        (languageStats.reduce((sum, stat) => sum + stat.count, 0) / 
         (totalContent * totalLanguages)) * 100
      ),
    };
  }
}

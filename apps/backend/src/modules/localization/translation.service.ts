import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  // Translation quality thresholds
  private readonly QUALITY_THRESHOLDS = {
    HIGH: 0.9,
    MEDIUM: 0.7,
    LOW: 0.5,
  };

  // Medical terminology dictionaries for different languages
  private readonly medicalTerminology = {
    sw: {
      'snakebite': 'sumu ya nyoka',
      'antivenom': 'dawa ya sumu',
      'hospital': 'hospitali',
      'emergency': 'dharura',
      'first aid': 'huduma ya kwanza',
      'venom': 'sumu',
      'symptoms': 'dalili',
      'treatment': 'matibabu',
      'prevention': 'uzuio',
      'dangerous': 'hatari',
      'poisonous': 'wenye sumu',
      'bite': 'kumeza',
      'wound': 'jeraha',
      'pain': 'maumivu',
      'swelling': 'uvimbe',
      'nausea': 'kichefuchefu',
      'dizziness': 'kizunguzungu',
      'breathing': 'kupumua',
      'heart': 'moyo',
      'blood': 'damu',
    },
    fr: {
      'snakebite': 'morsure de serpent',
      'antivenom': 'antivenin',
      'hospital': 'hôpital',
      'emergency': 'urgence',
      'first aid': 'premiers secours',
      'venom': 'venin',
      'symptoms': 'symptômes',
      'treatment': 'traitement',
      'prevention': 'prévention',
      'dangerous': 'dangereux',
      'poisonous': 'venimeux',
      'bite': 'morsure',
      'wound': 'blessure',
      'pain': 'douleur',
      'swelling': 'gonflement',
      'nausea': 'nausée',
      'dizziness': 'vertige',
      'breathing': 'respiration',
      'heart': 'cœur',
      'blood': 'sang',
    },
    ar: {
      'snakebite': 'لدغة ثعبان',
      'antivenom': 'مضاد السم',
      'hospital': 'مستشفى',
      'emergency': 'طوارئ',
      'first aid': 'الإسعافات الأولية',
      'venom': 'سم',
      'symptoms': 'أعراض',
      'treatment': 'علاج',
      'prevention': 'وقاية',
      'dangerous': 'خطير',
      'poisonous': 'سام',
      'bite': 'لدغة',
      'wound': 'جرح',
      'pain': 'ألم',
      'swelling': 'تورم',
      'nausea': 'غثيان',
      'dizziness': 'دوار',
      'breathing': 'تنفس',
      'heart': 'قلب',
      'blood': 'دم',
    },
    am: {
      'snakebite': 'እባት መንከስ',
      'antivenom': 'መርዝ መቃወሚያ',
      'hospital': 'ሆስፒታል',
      'emergency': 'አስቸኳይ',
      'first aid': 'የመጀመሪያ እርዳታ',
      'venom': 'መርዝ',
      'symptoms': 'ምልክቶች',
      'treatment': 'ሕክምና',
      'prevention': 'መከላከል',
      'dangerous': 'አደገኛ',
      'poisonous': 'መርዝ ያለው',
      'bite': 'መንከስ',
      'wound': 'ጉዳት',
      'pain': 'ህመም',
      'swelling': 'መጨናነቅ',
      'nausea': 'ማቅለሽለሽ',
      'dizziness': 'ማዞር',
      'breathing': 'መተንፈስ',
      'heart': 'ልብ',
      'blood': 'ደም',
    },
    rw: {
      'snakebite': 'gukomwa n\'inzoka',
      'antivenom': 'umuti w\'urwango',
      'hospital': 'indwara',
      'emergency': 'ibyihutirwa',
      'first aid': 'ubufasha bw\'ibanze',
      'venom': 'urwango',
      'symptoms': 'ibimenyetso',
      'treatment': 'gukiza',
      'prevention': 'guhangana',
      'dangerous': 'kabura',
      'poisonous': 'ifite urwango',
      'bite': 'gukomwa',
      'wound': 'ikimenyetso',
      'pain': 'ububabare',
      'swelling': 'gukura',
      'nausea': 'guhinda',
      'dizziness': 'guhindagurika',
      'breathing': 'guhumeka',
      'heart': 'umutima',
      'blood': 'amaraso',
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getSupportedLanguages() {
    this.logger.log('Getting supported languages for translation');
    
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'sw', name: 'Kiswahili', nativeName: 'Kiswahili' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
      { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
    ];
  }

  async getActiveLanguages() {
    this.logger.log('Getting active languages for translation');
    
    // In a real implementation, this would check which languages are currently active
    return await this.getSupportedLanguages();
  }

  async translateContent(originalContent: any, targetLanguage: string) {
    this.logger.log(`Translating content to ${targetLanguage}`);
    
    if (originalContent.language === targetLanguage) {
      return {
        title: originalContent.title,
        content: originalContent.content,
        confidence: 1.0,
        translator: 'original',
      };
    }

    // For now, we'll use a simple translation approach
    // In a real implementation, this would integrate with translation APIs
    const translation = await this.performTranslation(originalContent, targetLanguage);
    
    return translation;
  }

  private async performTranslation(content: any, targetLanguage: string) {
    this.logger.log(`Performing translation to ${targetLanguage}`);
    
    // Simple translation logic - in production, this would use professional translation services
    const translatedTitle = await this.translateText(content.title, targetLanguage);
    const translatedContent = await this.translateText(content.content, targetLanguage);
    
    // Calculate confidence based on translation quality
    const confidence = this.calculateTranslationConfidence(content, targetLanguage);
    
    return {
      title: translatedTitle,
      content: translatedContent,
      confidence,
      translator: 'SnaKTox Translation Service',
    };
  }

  private async translateText(text: string, targetLanguage: string): Promise<string> {
    // Simple translation using medical terminology dictionary
    const terminology = this.medicalTerminology[targetLanguage];
    if (!terminology) {
      // Fallback to basic translation
      return this.basicTranslation(text, targetLanguage);
    }

    let translatedText = text;
    
    // Replace medical terms
    for (const [english, translation] of Object.entries(terminology)) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, translation as string);
    }

    return translatedText;
  }

  private basicTranslation(text: string, targetLanguage: string): string {
    // Basic translation patterns for common phrases
    const commonPhrases = {
      sw: {
        'Keep calm': 'Kaa utulivu',
        'Call emergency': 'Piga simu ya dharura',
        'Go to hospital': 'Nenda hospitalini',
        'Do not panic': 'Usiogope',
        'Stay still': 'Kaa bado',
        'Remove jewelry': 'Ondoa mapambo',
        'Apply pressure': 'Sukuma',
        'Seek help': 'Tafuta msaada',
      },
      fr: {
        'Keep calm': 'Restez calme',
        'Call emergency': 'Appelez les urgences',
        'Go to hospital': 'Allez à l\'hôpital',
        'Do not panic': 'Ne paniquez pas',
        'Stay still': 'Restez immobile',
        'Remove jewelry': 'Retirez les bijoux',
        'Apply pressure': 'Appliquez une pression',
        'Seek help': 'Demandez de l\'aide',
      },
      ar: {
        'Keep calm': 'ابق هادئاً',
        'Call emergency': 'اتصل بالطوارئ',
        'Go to hospital': 'اذهب إلى المستشفى',
        'Do not panic': 'لا تذعر',
        'Stay still': 'ابق ساكناً',
        'Remove jewelry': 'أزل المجوهرات',
        'Apply pressure': 'اضغط',
        'Seek help': 'اطلب المساعدة',
      },
    };

    const phrases = commonPhrases[targetLanguage];
    if (!phrases) {
      return text; // Return original text if no translation available
    }

    let translatedText = text;
    for (const [english, translation] of Object.entries(phrases)) {
      const regex = new RegExp(english, 'gi');
      translatedText = translatedText.replace(regex, translation as string);
    }

    return translatedText;
  }

  private calculateTranslationConfidence(content: any, targetLanguage: string): number {
    // Calculate confidence based on various factors
    let confidence = 0.5; // Base confidence

    // Check if medical terminology is available
    if (this.medicalTerminology[targetLanguage]) {
      confidence += 0.2;
    }

    // Check content complexity
    const wordCount = content.content.split(' ').length;
    if (wordCount < 100) {
      confidence += 0.1;
    } else if (wordCount > 500) {
      confidence -= 0.1;
    }

    // Check for medical terms
    const medicalTerms = Object.keys(this.medicalTerminology[targetLanguage] || {});
    const foundTerms = medicalTerms.filter(term => 
      content.content.toLowerCase().includes(term.toLowerCase())
    );
    
    if (foundTerms.length > 0) {
      confidence += Math.min(0.2, foundTerms.length * 0.05);
    }

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  async getTranslationCoverage() {
    this.logger.log('Getting translation coverage');
    
    const languages = await this.getActiveLanguages();
    const coverage = {};

    for (const language of languages) {
      const contentCount = await this.prisma.educationMaterial.count({
        where: {
          language: language.code,
          isActive: true,
        },
      });

      const totalContent = await this.prisma.educationMaterial.count({
        where: { isActive: true },
      });

      coverage[language.code] = {
        language: language.name,
        contentCount,
        totalContent,
        coverage: totalContent > 0 ? Math.round((contentCount / totalContent) * 100) : 0,
      };
    }

    return coverage;
  }

  async validateTranslation(contentId: string, language: string, userId: string) {
    this.logger.log(`Validating translation for content ${contentId} in ${language}`);
    
    const content = await this.prisma.educationMaterial.findFirst({
      where: {
        id: contentId,
        language,
      },
    });

    if (!content) {
      throw new Error(`Content not found for ID ${contentId} in language ${language}`);
    }

    // Log validation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'translation_validated',
        userId,
        metadata: {
          contentId,
          language,
          validatedAt: new Date().toISOString(),
        },
      },
    });

    return {
      contentId,
      language,
      validated: true,
      validatedBy: userId,
      validatedAt: new Date().toISOString(),
    };
  }

  async getTranslationQualityMetrics() {
    this.logger.log('Getting translation quality metrics');
    
    const translations = await this.prisma.educationMaterial.findMany({
      where: {
        metadata: {
          path: ['translationMethod'],
          equals: 'automated',
        },
      },
      select: {
        language: true,
        metadata: true,
      },
    });

    const qualityMetrics = {
      totalTranslations: translations.length,
      averageConfidence: 0,
      confidenceByLanguage: {},
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

        // Quality distribution
        if (confidence >= this.QUALITY_THRESHOLDS.HIGH) {
          qualityMetrics.qualityDistribution.high++;
        } else if (confidence >= this.QUALITY_THRESHOLDS.MEDIUM) {
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
    }

    return qualityMetrics;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  // Extended language support for regional expansion
  private readonly supportedLanguages = {
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      region: 'Global',
      isRTL: false,
      isActive: true,
      countries: ['KE', 'TZ', 'UG', 'RW', 'ET'],
    },
    sw: {
      code: 'sw',
      name: 'Kiswahili',
      nativeName: 'Kiswahili',
      region: 'East Africa',
      isRTL: false,
      isActive: true,
      countries: ['KE', 'TZ', 'UG'],
    },
    fr: {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      region: 'West Africa',
      isRTL: false,
      isActive: true,
      countries: ['RW'],
    },
    ar: {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      region: 'North Africa',
      isRTL: true,
      isActive: true,
      countries: [],
    },
    am: {
      code: 'am',
      name: 'Amharic',
      nativeName: 'አማርኛ',
      region: 'East Africa',
      isRTL: false,
      isActive: true,
      countries: ['ET'],
    },
    ha: {
      code: 'ha',
      name: 'Hausa',
      nativeName: 'Hausa',
      region: 'West Africa',
      isRTL: false,
      isActive: false,
      countries: [],
    },
    yo: {
      code: 'yo',
      name: 'Yoruba',
      nativeName: 'Yorùbá',
      region: 'West Africa',
      isRTL: false,
      isActive: false,
      countries: [],
    },
    ig: {
      code: 'ig',
      name: 'Igbo',
      nativeName: 'Igbo',
      region: 'West Africa',
      isRTL: false,
      isActive: false,
      countries: [],
    },
    zu: {
      code: 'zu',
      name: 'Zulu',
      nativeName: 'isiZulu',
      region: 'South Africa',
      isRTL: false,
      isActive: false,
      countries: [],
    },
    xh: {
      code: 'xh',
      name: 'Xhosa',
      nativeName: 'isiXhosa',
      region: 'South Africa',
      isRTL: false,
      isActive: false,
      countries: [],
    },
    rw: {
      code: 'rw',
      name: 'Kinyarwanda',
      nativeName: 'Ikinyarwanda',
      region: 'East Africa',
      isRTL: false,
      isActive: true,
      countries: ['RW'],
    },
    so: {
      code: 'so',
      name: 'Somali',
      nativeName: 'Soomaali',
      region: 'East Africa',
      isRTL: false,
      isActive: false,
      countries: [],
    },
    om: {
      code: 'om',
      name: 'Oromo',
      nativeName: 'Afaan Oromoo',
      region: 'East Africa',
      isRTL: false,
      isActive: false,
      countries: ['ET'],
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getSupportedLanguages() {
    this.logger.log('Getting all supported languages');
    
    return Object.values(this.supportedLanguages);
  }

  async getActiveLanguages() {
    this.logger.log('Getting active languages');
    
    return Object.values(this.supportedLanguages).filter(lang => lang.isActive);
  }

  async getLanguageByCode(code: string) {
    this.logger.log(`Getting language by code: ${code}`);
    
    const language = this.supportedLanguages[code.toLowerCase()];
    if (!language) {
      throw new Error(`Language with code ${code} not found`);
    }
    
    return language;
  }

  async getLanguagesByRegion(region: string) {
    this.logger.log(`Getting languages by region: ${region}`);
    
    return Object.values(this.supportedLanguages).filter(lang => lang.region === region);
  }

  async getLanguagesByCountry(countryCode: string) {
    this.logger.log(`Getting languages by country: ${countryCode}`);
    
    return Object.values(this.supportedLanguages).filter(lang => 
      lang.countries.includes(countryCode.toUpperCase())
    );
  }

  async activateLanguage(code: string) {
    this.logger.log(`Activating language: ${code}`);
    
    const language = this.supportedLanguages[code.toLowerCase()];
    if (!language) {
      throw new Error(`Language with code ${code} not found`);
    }

    language.isActive = true;
    
    // Log language activation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'language_activation',
        metadata: {
          languageCode: code,
          languageName: language.name,
          activatedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Language ${code} activated successfully`);
    return language;
  }

  async deactivateLanguage(code: string) {
    this.logger.log(`Deactivating language: ${code}`);
    
    const language = this.supportedLanguages[code.toLowerCase()];
    if (!language) {
      throw new Error(`Language with code ${code} not found`);
    }

    language.isActive = false;
    
    // Log language deactivation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'language_deactivation',
        metadata: {
          languageCode: code,
          languageName: language.name,
          deactivatedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Language ${code} deactivated successfully`);
    return language;
  }

  async getLanguageStatistics() {
    this.logger.log('Getting language statistics');
    
    const totalLanguages = Object.keys(this.supportedLanguages).length;
    const activeLanguages = Object.values(this.supportedLanguages).filter(lang => lang.isActive).length;
    
    const languagesByRegion = Object.values(this.supportedLanguages).reduce((acc, lang) => {
      if (!acc[lang.region]) {
        acc[lang.region] = 0;
      }
      acc[lang.region]++;
      return acc;
    }, {});

    const rtlLanguages = Object.values(this.supportedLanguages).filter(lang => lang.isRTL).length;
    const ltrLanguages = totalLanguages - rtlLanguages;

    return {
      totalLanguages,
      activeLanguages,
      languagesByRegion,
      rtlLanguages,
      ltrLanguages,
    };
  }

  async getContentByLanguage(languageCode: string) {
    this.logger.log(`Getting content by language: ${languageCode}`);
    
    const content = await this.prisma.educationMaterial.findMany({
      where: {
        language: languageCode,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return content;
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

      coverage[language.code] = {
        language: language.name,
        contentCount,
        coverage: contentCount > 0 ? 'Available' : 'Pending',
      };
    }

    return coverage;
  }

  async getLanguageUsage() {
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

  async detectUserLanguage(userAgent: string, acceptLanguage: string) {
    this.logger.log('Detecting user language');
    
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality] = lang.trim().split(';q=');
        return {
          code: code.split('-')[0],
          quality: quality ? parseFloat(quality) : 1.0,
        };
      })
      .sort((a, b) => b.quality - a.quality);

    // Find the best supported language
    for (const lang of languages) {
      if (this.supportedLanguages[lang.code]?.isActive) {
        return lang.code;
      }
    }

    // Default to English if no supported language found
    return 'en';
  }

  async getLanguageResources(languageCode: string) {
    this.logger.log(`Getting language resources for: ${languageCode}`);
    
    const language = await this.getLanguageByCode(languageCode);
    
    return {
      language,
      resources: {
        dictionaries: await this.getDictionaries(languageCode),
        fonts: await this.getFonts(languageCode),
        keyboards: await this.getKeyboards(languageCode),
        voice: await this.getVoiceResources(languageCode),
      },
    };
  }

  private async getDictionaries(languageCode: string) {
    // This would typically come from a database or external API
    const dictionaries = {
      sw: ['Swahili-English Dictionary', 'Medical Terms Dictionary'],
      fr: ['French-English Dictionary', 'Medical Terms Dictionary'],
      ar: ['Arabic-English Dictionary', 'Medical Terms Dictionary'],
      am: ['Amharic-English Dictionary', 'Medical Terms Dictionary'],
    };

    return dictionaries[languageCode] || [];
  }

  private async getFonts(languageCode: string) {
    // This would typically come from a database or external API
    const fonts = {
      ar: ['Noto Sans Arabic', 'Amiri', 'Scheherazade'],
      am: ['Noto Sans Ethiopic', 'Abyssinica SIL'],
      rw: ['Noto Sans', 'Open Sans'],
    };

    return fonts[languageCode] || ['Noto Sans', 'Open Sans'];
  }

  private async getKeyboards(languageCode: string) {
    // This would typically come from a database or external API
    const keyboards = {
      ar: ['Arabic Keyboard', 'Arabic Phonetic'],
      am: ['Amharic Keyboard', 'Ethiopic Keyboard'],
      rw: ['Kinyarwanda Keyboard'],
    };

    return keyboards[languageCode] || [];
  }

  private async getVoiceResources(languageCode: string) {
    // This would typically come from a database or external API
    const voiceResources = {
      sw: ['Swahili TTS', 'Swahili Voice Recognition'],
      fr: ['French TTS', 'French Voice Recognition'],
      ar: ['Arabic TTS', 'Arabic Voice Recognition'],
      am: ['Amharic TTS', 'Amharic Voice Recognition'],
    };

    return voiceResources[languageCode] || [];
  }
}

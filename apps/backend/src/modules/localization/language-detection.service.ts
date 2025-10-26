import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LanguageDetectionService {
  private readonly logger = new Logger(LanguageDetectionService.name);

  // Language detection patterns
  private readonly languagePatterns = {
    sw: {
      patterns: [
        /\b(na|ya|wa|za|la|cha|vya|kwa|hapa|huko|hivyo|hii|hili|hili|hizi|hizo)\b/gi,
        /\b(mimi|wewe|yeye|sisi|nyinyi|wao)\b/gi,
        /\b(ni|si|kuwa|kuna|pana|mna|wana)\b/gi,
        /\b(asante|karibu|pole|samahani|tafadhali)\b/gi,
      ],
      weight: 0.3,
    },
    fr: {
      patterns: [
        /\b(le|la|les|un|une|des|du|de|au|aux)\b/gi,
        /\b(je|tu|il|elle|nous|vous|ils|elles)\b/gi,
        /\b(est|sont|avoir|être|faire|aller)\b/gi,
        /\b(merci|bonjour|au revoir|excusez|s'il vous plaît)\b/gi,
      ],
      weight: 0.3,
    },
    ar: {
      patterns: [
        /[\u0600-\u06FF]/g, // Arabic script
        /\b(ال|في|من|إلى|على|مع|بعد|قبل)\b/gi,
        /\b(أنا|أنت|هو|هي|نحن|أنتم|هم|هن)\b/gi,
        /\b(شكراً|مرحباً|مع السلامة|عذراً|من فضلك)\b/gi,
      ],
      weight: 0.4,
    },
    am: {
      patterns: [
        /[\u1200-\u137F]/g, // Ethiopic script
        /\b(እኔ|አንተ|እሱ|እሷ|እኛ|እናንተ|እነሱ|እነሷ)\b/gi,
        /\b(አለ|አሉ|አላቸው|አላት|አለን|አላችሁ|አላቸው)\b/gi,
        /\b(አመሰግናለሁ|በጃሽ|ይቅርታ|እባክህ)\b/gi,
      ],
      weight: 0.4,
    },
    rw: {
      patterns: [
        /\b(na|ya|wa|za|la|cha|vya|kwa|hapa|huko|hivyo)\b/gi,
        /\b(jewe|wowe|we|twebwe|mwebwe|bo)\b/gi,
        /\b(ni|si|kuba|kuba|kuba|kuba)\b/gi,
        /\b(murakoze|murakaza|ihangane|ihangane|nyamuneka)\b/gi,
      ],
      weight: 0.3,
    },
  };

  // Country to language mapping
  private readonly countryLanguageMap = {
    KE: ['en', 'sw'],
    TZ: ['sw', 'en'],
    UG: ['en', 'sw'],
    RW: ['rw', 'en', 'fr'],
    ET: ['am', 'en'],
  };

  constructor() {}

  async detectUserLanguage(userPreferences: any): Promise<string> {
    this.logger.log('Detecting user language from preferences');
    
    // Priority order for language detection
    const detectionMethods = [
      () => this.detectFromExplicitPreference(userPreferences),
      () => this.detectFromCountry(userPreferences),
      () => this.detectFromUserAgent(userPreferences),
      () => this.detectFromAcceptLanguage(userPreferences),
      () => this.detectFromContent(userPreferences),
    ];

    for (const method of detectionMethods) {
      try {
        const language = await method();
        if (language) {
          this.logger.log(`Language detected: ${language}`);
          return language;
        }
      } catch (error) {
        this.logger.warn(`Language detection method failed: ${error.message}`);
      }
    }

    // Default to English
    this.logger.log('No language detected, defaulting to English');
    return 'en';
  }

  private async detectFromExplicitPreference(userPreferences: any): Promise<string | null> {
    if (userPreferences?.language) {
      return userPreferences.language;
    }
    return null;
  }

  private async detectFromCountry(userPreferences: any): Promise<string | null> {
    if (userPreferences?.country) {
      const countryCode = userPreferences.country.toUpperCase();
      const languages = this.countryLanguageMap[countryCode];
      if (languages && languages.length > 0) {
        return languages[0]; // Return primary language
      }
    }
    return null;
  }

  private async detectFromUserAgent(userPreferences: any): Promise<string | null> {
    if (userPreferences?.userAgent) {
      const userAgent = userPreferences.userAgent.toLowerCase();
      
      // Check for language-specific keywords in user agent
      if (userAgent.includes('sw') || userAgent.includes('swahili')) {
        return 'sw';
      }
      if (userAgent.includes('fr') || userAgent.includes('french')) {
        return 'fr';
      }
      if (userAgent.includes('ar') || userAgent.includes('arabic')) {
        return 'ar';
      }
      if (userAgent.includes('am') || userAgent.includes('amharic')) {
        return 'am';
      }
      if (userAgent.includes('rw') || userAgent.includes('kinyarwanda')) {
        return 'rw';
      }
    }
    return null;
  }

  private async detectFromAcceptLanguage(userPreferences: any): Promise<string | null> {
    if (userPreferences?.acceptLanguage) {
      const acceptLanguage = userPreferences.acceptLanguage;
      
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

      // Find the first supported language
      for (const lang of languages) {
        if (this.isLanguageSupported(lang.code)) {
          return lang.code;
        }
      }
    }
    return null;
  }

  private async detectFromContent(userPreferences: any): Promise<string | null> {
    if (userPreferences?.content) {
      const content = userPreferences.content;
      const languageScores = {};

      // Initialize scores
      for (const language of Object.keys(this.languagePatterns)) {
        languageScores[language] = 0;
      }

      // Score each language based on pattern matches
      for (const [language, config] of Object.entries(this.languagePatterns)) {
        for (const pattern of config.patterns) {
          const matches = content.match(pattern);
          if (matches) {
            languageScores[language] += matches.length * config.weight;
          }
        }
      }

      // Find the language with the highest score
      let bestLanguage = null;
      let bestScore = 0;

      for (const [language, score] of Object.entries(languageScores)) {
        const typedScore = score as number;
        if (typedScore > bestScore) {
          bestScore = typedScore;
          bestLanguage = language;
        }
      }

      // Only return if confidence is high enough
      if (bestScore > 0.5) {
        return bestLanguage;
      }
    }
    return null;
  }

  private isLanguageSupported(languageCode: string): boolean {
    const supportedLanguages = ['en', 'sw', 'fr', 'ar', 'am', 'rw'];
    return supportedLanguages.includes(languageCode.toLowerCase());
  }

  async detectLanguageFromText(text: string): Promise<string> {
    this.logger.log('Detecting language from text content');
    
    const languageScores = {};

    // Initialize scores
    for (const language of Object.keys(this.languagePatterns)) {
      languageScores[language] = 0;
    }

    // Score each language based on pattern matches
    for (const [language, config] of Object.entries(this.languagePatterns)) {
      for (const pattern of config.patterns) {
        const matches = text.match(pattern);
        if (matches) {
          languageScores[language] += matches.length * config.weight;
        }
      }
    }

    // Find the language with the highest score
    let bestLanguage = 'en'; // Default to English
    let bestScore = 0;

    for (const [language, score] of Object.entries(languageScores)) {
      const typedScore = score as number;
      if (typedScore > bestScore) {
        bestScore = typedScore;
        bestLanguage = language;
      }
    }

    this.logger.log(`Language detected from text: ${bestLanguage} (confidence: ${bestScore})`);
    return bestLanguage;
  }

  async getLanguageConfidence(text: string, language: string): Promise<number> {
    this.logger.log(`Getting confidence for language ${language}`);
    
    const config = this.languagePatterns[language];
    if (!config) {
      return 0;
    }

    let totalMatches = 0;
    let totalWeight = 0;

    for (const pattern of config.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        totalMatches += matches.length;
        totalWeight += matches.length * config.weight;
      }
    }

    // Calculate confidence as a percentage
    const confidence = totalMatches > 0 ? Math.min(1, totalWeight / totalMatches) : 0;
    
    this.logger.log(`Language confidence for ${language}: ${confidence}`);
    return confidence;
  }

  async getSupportedLanguages(): Promise<string[]> {
    return Object.keys(this.languagePatterns);
  }

  async getLanguageInfo(languageCode: string) {
    const languageInfo = {
      en: { name: 'English', nativeName: 'English', script: 'Latin' },
      sw: { name: 'Kiswahili', nativeName: 'Kiswahili', script: 'Latin' },
      fr: { name: 'French', nativeName: 'Français', script: 'Latin' },
      ar: { name: 'Arabic', nativeName: 'العربية', script: 'Arabic' },
      am: { name: 'Amharic', nativeName: 'አማርኛ', script: 'Ethiopic' },
      rw: { name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', script: 'Latin' },
    };

    return languageInfo[languageCode] || null;
  }
}

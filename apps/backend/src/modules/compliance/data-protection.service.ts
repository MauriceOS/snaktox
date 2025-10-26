import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DataProtectionService {
  private readonly logger = new Logger(DataProtectionService.name);

  // Data protection frameworks for different countries
  private readonly dataProtectionFrameworks = {
    KE: {
      country: 'Kenya',
      law: 'Data Protection Act 2019',
      authority: 'Office of the Data Protection Commissioner',
      gdprCompliant: true,
      dataRetentionPeriod: 7, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: 72, // hours
      dpoRequired: true,
      privacyByDesign: true,
      impactAssessment: true,
      lawfulBasis: ['consent', 'legitimate_interest', 'vital_interest', 'public_task'],
    },
    TZ: {
      country: 'Tanzania',
      law: 'Personal Data Protection Act 2022',
      authority: 'Personal Data Protection Commission',
      gdprCompliant: false,
      dataRetentionPeriod: 5, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: false,
      breachNotification: 24, // hours
      dpoRequired: false,
      privacyByDesign: true,
      impactAssessment: false,
      lawfulBasis: ['consent', 'legitimate_interest', 'vital_interest'],
    },
    UG: {
      country: 'Uganda',
      law: 'Data Protection and Privacy Act 2019',
      authority: 'Personal Data Protection Office',
      gdprCompliant: false,
      dataRetentionPeriod: 6, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: 48, // hours
      dpoRequired: true,
      privacyByDesign: true,
      impactAssessment: true,
      lawfulBasis: ['consent', 'legitimate_interest', 'vital_interest', 'public_task'],
    },
    RW: {
      country: 'Rwanda',
      law: 'Law on Protection of Personal Data and Privacy 2021',
      authority: 'National Cyber Security Authority',
      gdprCompliant: true,
      dataRetentionPeriod: 5, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: 24, // hours
      dpoRequired: true,
      privacyByDesign: true,
      impactAssessment: true,
      lawfulBasis: ['consent', 'legitimate_interest', 'vital_interest', 'public_task'],
    },
    ET: {
      country: 'Ethiopia',
      law: 'Data Protection Proclamation 2020',
      authority: 'Ethiopian Data Protection Authority',
      gdprCompliant: false,
      dataRetentionPeriod: 5, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: false,
      breachNotification: 72, // hours
      dpoRequired: false,
      privacyByDesign: true,
      impactAssessment: false,
      lawfulBasis: ['consent', 'legitimate_interest', 'vital_interest'],
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getDataProtectionStatus() {
    this.logger.log('Getting data protection status');
    
    const status = {
      totalCountries: Object.keys(this.dataProtectionFrameworks).length,
      gdprCompliantCountries: Object.values(this.dataProtectionFrameworks).filter(f => f.gdprCompliant).length,
      frameworks: Object.values(this.dataProtectionFrameworks),
      lastUpdated: new Date().toISOString(),
    };

    return status;
  }

  async validateDataProcessing(countryCode: string, dataType: string, purpose: string) {
    this.logger.log(`Validating data processing for ${countryCode}: ${dataType} - ${purpose}`);
    
    const framework = this.dataProtectionFrameworks[countryCode.toUpperCase()];
    if (!framework) {
      throw new Error(`Data protection framework for country ${countryCode} not found`);
    }
    
    const validation = {
      country: framework.country,
      dataType,
      purpose,
      isCompliant: true,
      requirements: [],
      warnings: [],
      errors: [],
      lawfulBasis: this.determineLawfulBasis(purpose, framework.lawfulBasis),
    };

    // Check consent requirements
    if (framework.consentRequired) {
      validation.requirements.push('Explicit consent required');
    }

    // Check data minimization
    if (framework.dataMinimization) {
      validation.requirements.push('Data minimization principle applies');
    }

    // Check data retention
    validation.requirements.push(`Data retention period: ${framework.dataRetentionPeriod} years`);

    // Check breach notification
    validation.requirements.push(`Breach notification within ${framework.breachNotification} hours`);

    // Check DPO requirement
    if (framework.dpoRequired) {
      validation.requirements.push('Data Protection Officer required');
    }

    // Check privacy by design
    if (framework.privacyByDesign) {
      validation.requirements.push('Privacy by design principles must be applied');
    }

    // Check impact assessment
    if (framework.impactAssessment) {
      validation.requirements.push('Data Protection Impact Assessment may be required');
    }

    // Validate specific data types
    this.validateDataType(dataType, validation);
    this.validatePurpose(purpose, validation);

    return validation;
  }

  private determineLawfulBasis(purpose: string, availableBasis: string[]): string {
    const purposeMapping = {
      'emergency_response': 'vital_interest',
      'medical_treatment': 'vital_interest',
      'public_health': 'public_task',
      'research': 'legitimate_interest',
      'analytics': 'legitimate_interest',
      'marketing': 'consent',
      'service_provision': 'legitimate_interest',
    };

    const basis = purposeMapping[purpose] || 'consent';
    return availableBasis.includes(basis) ? basis : 'consent';
  }

  private validateDataType(dataType: string, validation: any) {
    const sensitiveDataTypes = ['health', 'biometric', 'genetic', 'location', 'financial'];
    
    if (sensitiveDataTypes.includes(dataType)) {
      validation.requirements.push(`Special protection required for ${dataType} data`);
      validation.warnings.push(`Additional safeguards needed for sensitive data type: ${dataType}`);
    }
  }

  private validatePurpose(purpose: string, validation: any) {
    const highRiskPurposes = ['automated_decision_making', 'profiling', 'research'];
    
    if (highRiskPurposes.includes(purpose)) {
      validation.requirements.push(`Additional safeguards required for high-risk purpose: ${purpose}`);
      validation.warnings.push(`Consider Data Protection Impact Assessment for: ${purpose}`);
    }
  }

  async generatePrivacyPolicy(countryCode: string, language: string = 'en') {
    this.logger.log(`Generating privacy policy for ${countryCode} in ${language}`);
    
    const framework = this.dataProtectionFrameworks[countryCode.toUpperCase()];
    if (!framework) {
      throw new Error(`Data protection framework for country ${countryCode} not found`);
    }
    
    const privacyPolicy = {
      country: framework.country,
      language,
      law: framework.law,
      authority: framework.authority,
      lastUpdated: new Date().toISOString(),
      sections: {
        dataCollection: this.getDataCollectionSection(framework, language),
        dataUsage: this.getDataUsageSection(framework, language),
        dataSharing: this.getDataSharingSection(framework, language),
        dataRetention: this.getDataRetentionSection(framework, language),
        userRights: this.getUserRightsSection(framework, language),
        contactInfo: this.getContactSection(countryCode, language),
      },
    };

    return privacyPolicy;
  }

  private getDataCollectionSection(framework: any, language: string) {
    const sections = {
      en: {
        title: 'Data Collection',
        content: `We collect personal data in accordance with ${framework.law}. We only collect data that is necessary for providing our snakebite emergency response services.`,
        dataTypes: [
          'Personal identification information',
          'Medical information (snakebite incidents)',
          'Location data (for emergency response)',
          'Contact information (for emergency notifications)',
        ],
      },
      sw: {
        title: 'Ukusanyaji wa Data',
        content: `Tunakusanya data ya kibinafsi kwa mujibu wa ${framework.law}. Tunakusanya data tu ambayo ni muhimu kwa kutoa huduma zetu za dharura za sumu ya nyoka.`,
        dataTypes: [
          'Taarifa za utambulisho wa kibinafsi',
          'Taarifa za matibabu (matukio ya sumu ya nyoka)',
          'Data ya eneo (kwa majibu ya dharura)',
          'Taarifa za mawasiliano (kwa arifa za dharura)',
        ],
      },
    };

    return sections[language] || sections.en;
  }

  private getDataUsageSection(framework: any, language: string) {
    const sections = {
      en: {
        title: 'Data Usage',
        content: 'We use your personal data for the following purposes:',
        purposes: [
          'Providing emergency response services',
          'Connecting you with nearby hospitals',
          'Sending emergency notifications',
          'Improving our services through analytics',
        ],
      },
      sw: {
        title: 'Matumizi ya Data',
        content: 'Tunatumia data yako ya kibinafsi kwa madhumuni yafuatayo:',
        purposes: [
          'Kutoa huduma za majibu ya dharura',
          'Kukuunganisha na hospitali za karibu',
          'Kutuma arifa za dharura',
          'Kuboresha huduma zetu kupitia uchambuzi',
        ],
      },
    };

    return sections[language] || sections.en;
  }

  private getDataSharingSection(framework: any, language: string) {
    const sections = {
      en: {
        title: 'Data Sharing',
        content: 'We may share your data with:',
        recipients: [
          'Emergency response teams',
          'Verified hospitals and medical facilities',
          'Government health authorities (when required by law)',
          'Research institutions (anonymized data only)',
        ],
      },
      sw: {
        title: 'Kushiriki Data',
        content: 'Tunaweza kushiriki data yako na:',
        recipients: [
          'Timu za majibu ya dharura',
          'Hospitali zilizothibitishwa na vituo vya matibabu',
          'Mamlaka za afya za serikali (wakati inahitajika kwa sheria)',
          'Taasisi za utafiti (data isiyojulikana tu)',
        ],
      },
    };

    return sections[language] || sections.en;
  }

  private getDataRetentionSection(framework: any, language: string) {
    const sections = {
      en: {
        title: 'Data Retention',
        content: `We retain your personal data for ${framework.dataRetentionPeriod} years in accordance with ${framework.law}. After this period, your data will be automatically deleted.`,
      },
      sw: {
        title: 'Kuhifadhi Data',
        content: `Tunahifadhi data yako ya kibinafsi kwa miaka ${framework.dataRetentionPeriod} kwa mujibu wa ${framework.law}. Baada ya kipindi hiki, data yako itafutwa kiotomatiki.`,
      },
    };

    return sections[language] || sections.en;
  }

  private getUserRightsSection(framework: any, language: string) {
    const sections = {
      en: {
        title: 'Your Rights',
        content: 'Under the data protection law, you have the following rights:',
        rights: [
          'Right to access your personal data',
          'Right to correct inaccurate data',
          framework.rightToErasure ? 'Right to delete your data' : null,
          framework.dataPortability ? 'Right to data portability' : null,
          'Right to object to processing',
          'Right to withdraw consent',
        ].filter(Boolean),
      },
      sw: {
        title: 'Haki Zako',
        content: 'Chini ya sheria ya ulinzi wa data, una haki zifuatazo:',
        rights: [
          'Haki ya kupata data yako ya kibinafsi',
          'Haki ya kusahihisha data isiyo sahihi',
          framework.rightToErasure ? 'Haki ya kufuta data yako' : null,
          framework.dataPortability ? 'Haki ya kuhamisha data' : null,
          'Haki ya kupinga usindikaji',
          'Haki ya kujiondoa kwa ridhaa',
        ].filter(Boolean),
      },
    };

    return sections[language] || sections.en;
  }

  private getContactSection(countryCode: string, language: string) {
    const contacts = {
      KE: {
        authority: 'Office of the Data Protection Commissioner',
        email: 'info@odpc.go.ke',
        phone: '+254-20-2217766',
        website: 'https://www.odpc.go.ke',
        address: 'P.O. Box 30920-00100, Nairobi, Kenya',
      },
      TZ: {
        authority: 'Personal Data Protection Commission',
        email: 'info@pdpc.go.tz',
        phone: '+255-22-211-0000',
        website: 'https://www.pdpc.go.tz',
        address: 'P.O. Box 9182, Dar es Salaam, Tanzania',
      },
      UG: {
        authority: 'Personal Data Protection Office',
        email: 'info@pdpo.go.ug',
        phone: '+256-41-425-0000',
        website: 'https://www.pdpo.go.ug',
        address: 'P.O. Box 7001, Kampala, Uganda',
      },
      RW: {
        authority: 'National Cyber Security Authority',
        email: 'info@ncsa.gov.rw',
        phone: '+250-788-888-888',
        website: 'https://www.ncsa.gov.rw',
        address: 'P.O. Box 1234, Kigali, Rwanda',
      },
      ET: {
        authority: 'Ethiopian Data Protection Authority',
        email: 'info@dpa.gov.et',
        phone: '+251-11-123-4567',
        website: 'https://www.dpa.gov.et',
        address: 'P.O. Box 1234, Addis Ababa, Ethiopia',
      },
    };

    const contact = contacts[countryCode.toUpperCase()];
    
    const sections = {
      en: {
        title: 'Contact Information',
        content: 'If you have any questions about this privacy policy or your data rights, please contact us:',
        contact,
      },
      sw: {
        title: 'Taarifa za Mawasiliano',
        content: 'Ikiwa una maswali yoyote kuhusu sera hii ya faragha au haki zako za data, tafadhali wasiliana nasi:',
        contact,
      },
    };

    return sections[language] || sections.en;
  }

  async checkDataRetention(countryCode: string, dataType: string) {
    this.logger.log(`Checking data retention for ${countryCode}: ${dataType}`);
    
    const framework = this.dataProtectionFrameworks[countryCode.toUpperCase()];
    if (!framework) {
      throw new Error(`Data protection framework for country ${countryCode} not found`);
    }
    
    return {
      country: framework.country,
      dataType,
      retentionPeriod: framework.dataRetentionPeriod,
      unit: 'years',
      autoDeletion: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getDataSubjectRights(countryCode: string) {
    this.logger.log(`Getting data subject rights for country: ${countryCode}`);
    
    const framework = this.dataProtectionFrameworks[countryCode.toUpperCase()];
    if (!framework) {
      throw new Error(`Data protection framework for country ${countryCode} not found`);
    }
    
    const rights = {
      rightToAccess: true,
      rightToRectification: true,
      rightToErasure: framework.rightToErasure,
      rightToDataPortability: framework.dataPortability,
      rightToObject: true,
      rightToRestrictProcessing: true,
      rightToWithdrawConsent: true,
    };

    return {
      country: framework.country,
      rights,
      contactInfo: this.getContactSection(countryCode, 'en').contact,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  // Compliance frameworks for different countries
  private readonly complianceFrameworks = {
    KE: {
      country: 'Kenya',
      dataProtectionLaw: 'Data Protection Act 2019',
      healthDataLaw: 'Health Act 2017',
      gdprCompliance: true,
      dataRetentionPeriod: 7, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: 72, // hours
      dpoRequired: true,
      privacyByDesign: true,
      impactAssessment: true,
    },
    TZ: {
      country: 'Tanzania',
      dataProtectionLaw: 'Personal Data Protection Act 2022',
      healthDataLaw: 'Health Act 2019',
      gdprCompliance: false,
      dataRetentionPeriod: 5, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: false,
      breachNotification: 24, // hours
      dpoRequired: false,
      privacyByDesign: true,
      impactAssessment: false,
    },
    UG: {
      country: 'Uganda',
      dataProtectionLaw: 'Data Protection and Privacy Act 2019',
      healthDataLaw: 'Public Health Act 2015',
      gdprCompliance: false,
      dataRetentionPeriod: 6, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: 48, // hours
      dpoRequired: true,
      privacyByDesign: true,
      impactAssessment: true,
    },
    RW: {
      country: 'Rwanda',
      dataProtectionLaw: 'Law on Protection of Personal Data and Privacy 2021',
      healthDataLaw: 'Law on Public Health 2018',
      gdprCompliance: true,
      dataRetentionPeriod: 5, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: 24, // hours
      dpoRequired: true,
      privacyByDesign: true,
      impactAssessment: true,
    },
    ET: {
      country: 'Ethiopia',
      dataProtectionLaw: 'Data Protection Proclamation 2020',
      healthDataLaw: 'Public Health Proclamation 2012',
      gdprCompliance: false,
      dataRetentionPeriod: 5, // years
      consentRequired: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: false,
      breachNotification: 72, // hours
      dpoRequired: false,
      privacyByDesign: true,
      impactAssessment: false,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getComplianceFramework(countryCode: string) {
    this.logger.log(`Getting compliance framework for country: ${countryCode}`);
    
    const framework = this.complianceFrameworks[countryCode.toUpperCase()];
    if (!framework) {
      throw new Error(`Compliance framework for country ${countryCode} not found`);
    }
    
    return framework;
  }

  async validateDataProcessing(countryCode: string, dataType: string, purpose: string) {
    this.logger.log(`Validating data processing for ${countryCode}: ${dataType} - ${purpose}`);
    
    const framework = await this.getComplianceFramework(countryCode);
    
    const validation = {
      country: framework.country,
      dataType,
      purpose,
      isCompliant: true,
      requirements: [],
      warnings: [],
      errors: [],
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

    // Log validation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'compliance_validation',
        metadata: {
          countryCode,
          dataType,
          purpose,
          isCompliant: validation.isCompliant,
          requirements: validation.requirements,
          validatedAt: new Date().toISOString(),
        },
      },
    });

    return validation;
  }

  async checkDataRetention(countryCode: string, dataType: string) {
    this.logger.log(`Checking data retention for ${countryCode}: ${dataType}`);
    
    const framework = await this.getComplianceFramework(countryCode);
    
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
    
    const framework = await this.getComplianceFramework(countryCode);
    
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
      contactInfo: await this.getDataProtectionContact(countryCode),
    };
  }

  async getDataProtectionContact(countryCode: string) {
    this.logger.log(`Getting data protection contact for country: ${countryCode}`);
    
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

    return contacts[countryCode.toUpperCase()] || null;
  }

  async generatePrivacyPolicy(countryCode: string, language: string = 'en') {
    this.logger.log(`Generating privacy policy for ${countryCode} in ${language}`);
    
    const framework = await this.getComplianceFramework(countryCode);
    
    const privacyPolicy = {
      country: framework.country,
      language,
      lastUpdated: new Date().toISOString(),
      sections: {
        dataCollection: await this.getDataCollectionSection(framework, language),
        dataUsage: await this.getDataUsageSection(framework, language),
        dataSharing: await this.getDataSharingSection(framework, language),
        dataRetention: await this.getDataRetentionSection(framework, language),
        userRights: await this.getUserRightsSection(framework, language),
        contactInfo: await this.getContactSection(countryCode, language),
      },
    };

    return privacyPolicy;
  }

  private async getDataCollectionSection(framework: any, language: string) {
    const sections = {
      en: {
        title: 'Data Collection',
        content: `We collect personal data in accordance with ${framework.dataProtectionLaw}. We only collect data that is necessary for providing our snakebite emergency response services.`,
        dataTypes: [
          'Personal identification information',
          'Medical information (snakebite incidents)',
          'Location data (for emergency response)',
          'Contact information (for emergency notifications)',
        ],
      },
      sw: {
        title: 'Ukusanyaji wa Data',
        content: `Tunakusanya data ya kibinafsi kwa mujibu wa ${framework.dataProtectionLaw}. Tunakusanya data tu ambayo ni muhimu kwa kutoa huduma zetu za dharura za sumu ya nyoka.`,
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

  private async getDataUsageSection(framework: any, language: string) {
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

  private async getDataSharingSection(framework: any, language: string) {
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

  private async getDataRetentionSection(framework: any, language: string) {
    const sections = {
      en: {
        title: 'Data Retention',
        content: `We retain your personal data for ${framework.dataRetentionPeriod} years in accordance with ${framework.dataProtectionLaw}. After this period, your data will be automatically deleted.`,
      },
      sw: {
        title: 'Kuhifadhi Data',
        content: `Tunahifadhi data yako ya kibinafsi kwa miaka ${framework.dataRetentionPeriod} kwa mujibu wa ${framework.dataProtectionLaw}. Baada ya kipindi hiki, data yako itafutwa kiotomatiki.`,
      },
    };

    return sections[language] || sections.en;
  }

  private async getUserRightsSection(framework: any, language: string) {
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

  private async getContactSection(countryCode: string, language: string) {
    const contact = await this.getDataProtectionContact(countryCode);
    
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

  async auditCompliance(countryCode: string) {
    this.logger.log(`Auditing compliance for country: ${countryCode}`);
    
    const framework = await this.getComplianceFramework(countryCode);
    
    const audit = {
      country: framework.country,
      auditDate: new Date().toISOString(),
      complianceScore: 0,
      findings: [],
      recommendations: [],
    };

    // Check GDPR compliance
    if (framework.gdprCompliance) {
      audit.complianceScore += 20;
      audit.findings.push('GDPR compliant');
    } else {
      audit.recommendations.push('Consider GDPR compliance for international operations');
    }

    // Check DPO requirement
    if (framework.dpoRequired) {
      audit.complianceScore += 15;
      audit.findings.push('Data Protection Officer required');
    }

    // Check privacy by design
    if (framework.privacyByDesign) {
      audit.complianceScore += 15;
      audit.findings.push('Privacy by design implemented');
    }

    // Check impact assessment
    if (framework.impactAssessment) {
      audit.complianceScore += 10;
      audit.findings.push('Data Protection Impact Assessment required');
    }

    // Check data portability
    if (framework.dataPortability) {
      audit.complianceScore += 10;
      audit.findings.push('Data portability rights available');
    }

    // Check breach notification
    if (framework.breachNotification <= 72) {
      audit.complianceScore += 10;
      audit.findings.push(`Breach notification within ${framework.breachNotification} hours`);
    }

    // Check consent requirements
    if (framework.consentRequired) {
      audit.complianceScore += 10;
      audit.findings.push('Explicit consent required');
    }

    // Check data minimization
    if (framework.dataMinimization) {
      audit.complianceScore += 10;
      audit.findings.push('Data minimization principle applied');
    }

    // Log audit
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'compliance_audit',
        metadata: {
          countryCode,
          complianceScore: audit.complianceScore,
          findings: audit.findings,
          recommendations: audit.recommendations,
          auditDate: audit.auditDate,
        },
      },
    });

    return audit;
  }
}

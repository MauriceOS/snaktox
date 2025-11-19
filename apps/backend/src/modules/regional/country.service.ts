import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  // Supported countries for SnaKTox expansion
  private readonly supportedCountries = {
    KE: {
      code: 'KE',
      name: 'Kenya',
      region: 'East Africa',
      capital: 'Nairobi',
      population: 54000000,
      languages: ['en', 'sw'],
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      emergencyNumber: '999',
      healthMinistry: 'Ministry of Health Kenya',
      dataProtectionLaw: 'Data Protection Act 2019',
      isActive: true,
    },
    TZ: {
      code: 'TZ',
      name: 'Tanzania',
      region: 'East Africa',
      capital: 'Dodoma',
      population: 62000000,
      languages: ['en', 'sw'],
      currency: 'TZS',
      timezone: 'Africa/Dar_es_Salaam',
      emergencyNumber: '112',
      healthMinistry: 'Ministry of Health Tanzania',
      dataProtectionLaw: 'Personal Data Protection Act 2022',
      isActive: false,
    },
    UG: {
      code: 'UG',
      name: 'Uganda',
      region: 'East Africa',
      capital: 'Kampala',
      population: 47000000,
      languages: ['en', 'sw'],
      currency: 'UGX',
      timezone: 'Africa/Kampala',
      emergencyNumber: '999',
      healthMinistry: 'Ministry of Health Uganda',
      dataProtectionLaw: 'Data Protection and Privacy Act 2019',
      isActive: false,
    },
    RW: {
      code: 'RW',
      name: 'Rwanda',
      region: 'East Africa',
      capital: 'Kigali',
      population: 13000000,
      languages: ['en', 'fr', 'rw'],
      currency: 'RWF',
      timezone: 'Africa/Kigali',
      emergencyNumber: '112',
      healthMinistry: 'Ministry of Health Rwanda',
      dataProtectionLaw: 'Law on Protection of Personal Data and Privacy 2021',
      isActive: false,
    },
    ET: {
      code: 'ET',
      name: 'Ethiopia',
      region: 'East Africa',
      capital: 'Addis Ababa',
      population: 120000000,
      languages: ['en', 'am'],
      currency: 'ETB',
      timezone: 'Africa/Addis_Ababa',
      emergencyNumber: '911',
      healthMinistry: 'Ministry of Health Ethiopia',
      dataProtectionLaw: 'Data Protection Proclamation 2020',
      isActive: false,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getAllCountries() {
    this.logger.log('Getting all supported countries');
    
    return Object.values(this.supportedCountries);
  }

  async getActiveCountries() {
    this.logger.log('Getting active countries');
    
    return Object.values(this.supportedCountries).filter(country => country.isActive);
  }

  async getCountryByCode(code: string) {
    this.logger.log(`Getting country by code: ${code}`);
    
    const country = this.supportedCountries[code.toUpperCase()];
    if (!country) {
      throw new Error(`Country with code ${code} not found`);
    }
    
    return country;
  }

  async getCountriesByRegion() {
    this.logger.log('Getting countries by region');
    
    const countriesByRegion = Object.values(this.supportedCountries).reduce((acc, country) => {
      if (!acc[country.region]) {
        acc[country.region] = [];
      }
      acc[country.region].push(country);
      return acc;
    }, {});

    return countriesByRegion;
  }

  async getCountryCount() {
    this.logger.log('Getting country count');
    
    return Object.keys(this.supportedCountries).length;
  }

  async getActiveCountryCount() {
    this.logger.log('Getting active country count');
    
    return Object.values(this.supportedCountries).filter(country => country.isActive).length;
  }

  async activateCountry(code: string) {
    this.logger.log(`Activating country: ${code}`);
    
    const country = this.supportedCountries[code.toUpperCase()];
    if (!country) {
      throw new Error(`Country with code ${code} not found`);
    }

    country.isActive = true;
    
    // Log country activation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'country_activation',
        metadata: {
          countryCode: code,
          countryName: country.name,
          activatedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Country ${code} activated successfully`);
    return country;
  }

  async deactivateCountry(code: string) {
    this.logger.log(`Deactivating country: ${code}`);
    
    const country = this.supportedCountries[code.toUpperCase()];
    if (!country) {
      throw new Error(`Country with code ${code} not found`);
    }

    country.isActive = false;
    
    // Log country deactivation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'country_deactivation',
        metadata: {
          countryCode: code,
          countryName: country.name,
          deactivatedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Country ${code} deactivated successfully`);
    return country;
  }

  async getCountryStatistics(code: string) {
    this.logger.log(`Getting statistics for country: ${code}`);
    
    const country = await this.getCountryByCode(code);
    
    const hospitals = await this.prisma.hospital.count({
      where: { country: code },
    });

    const users = await this.prisma.user.count({
      where: {
        profile: {
          path: ['country'],
          equals: code,
        } as any, // MongoDB compatibility fix
      },
    });

    const incidents = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'sos_report',
        metadata: {
          path: ['country'],
          equals: code,
        } as any, // MongoDB compatibility fix
      },
    });

    return {
      country,
      hospitals,
      users,
      incidents,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getCountryCompliance(code: string) {
    this.logger.log(`Getting compliance information for country: ${code}`);
    
    const country = await this.getCountryByCode(code);
    
    return {
      dataProtectionLaw: country.dataProtectionLaw,
      healthMinistry: country.healthMinistry,
      emergencyNumber: country.emergencyNumber,
      timezone: country.timezone,
      currency: country.currency,
      languages: country.languages,
    };
  }

  async getCountryEmergencyContacts(code: string) {
    this.logger.log(`Getting emergency contacts for country: ${code}`);
    
    const country = await this.getCountryByCode(code);
    
    // This would typically come from a database or external API
    const emergencyContacts = {
      KE: [
        { name: 'Kenyatta National Hospital', phone: '+254-20-2726300', type: 'hospital' },
        { name: 'Moi Teaching and Referral Hospital', phone: '+254-53-2033471', type: 'hospital' },
        { name: 'Coast General Hospital', phone: '+254-41-2312191', type: 'hospital' },
        { name: 'Emergency Services', phone: '999', type: 'emergency' },
      ],
      TZ: [
        { name: 'Muhimbili National Hospital', phone: '+255-22-2151515', type: 'hospital' },
        { name: 'Emergency Services', phone: '112', type: 'emergency' },
      ],
      UG: [
        { name: 'Mulago National Referral Hospital', phone: '+256-41-425-0000', type: 'hospital' },
        { name: 'Emergency Services', phone: '999', type: 'emergency' },
      ],
    };

    return emergencyContacts[code] || [];
  }

  async getCountryHealthData(code: string) {
    this.logger.log(`Getting health data for country: ${code}`);
    
    const country = await this.getCountryByCode(code);
    
    // This would typically come from WHO, CDC, or local health ministries
    const healthData = {
      KE: {
        snakebiteIncidents: 15000,
        mortalityRate: 0.02,
        antivenomAvailability: 0.85,
        healthcareAccess: 0.78,
        lastUpdated: '2024-01-01',
      },
      TZ: {
        snakebiteIncidents: 12000,
        mortalityRate: 0.03,
        antivenomAvailability: 0.65,
        healthcareAccess: 0.72,
        lastUpdated: '2024-01-01',
      },
      UG: {
        snakebiteIncidents: 8000,
        mortalityRate: 0.025,
        antivenomAvailability: 0.70,
        healthcareAccess: 0.75,
        lastUpdated: '2024-01-01',
      },
    };

    return healthData[code] || null;
  }
}

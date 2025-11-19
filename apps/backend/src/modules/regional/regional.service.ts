import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CountryService } from './country.service';
import { LanguageService } from './language.service';
import { ComplianceService } from './compliance.service';
import { PartnershipService } from './partnership.service';

@Injectable()
export class RegionalService {
  private readonly logger = new Logger(RegionalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly countryService: CountryService,
    private readonly languageService: LanguageService,
    private readonly complianceService: ComplianceService,
    private readonly partnershipService: PartnershipService,
  ) {}

  async getRegionalOverview() {
    this.logger.log('Getting regional overview');
    
    const countries = await this.countryService.getAllCountries();
    const languages = await this.languageService.getSupportedLanguages();
    const partnerships = await this.partnershipService.getActivePartnerships();
    
    const regionalStats = await this.getRegionalStatistics();
    
    return {
      countries,
      languages,
      partnerships,
      statistics: regionalStats,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getRegionalStatistics() {
    this.logger.log('Getting regional statistics');
    
    const totalCountries = await this.countryService.getCountryCount();
    const totalHospitals = await this.prisma.hospital.count();
    const totalUsers = await this.prisma.user.count();
    const totalSosReports = await this.prisma.analyticsLog.count({
      where: { eventType: 'sos_report' },
    });
    
    const countriesByRegion = await this.countryService.getCountriesByRegion();
    const hospitalsByCountry = await this.getHospitalsByCountry();
    const incidentsByCountry = await this.getIncidentsByCountry();
    
    return {
      totalCountries,
      totalHospitals,
      totalUsers,
      totalSosReports,
      countriesByRegion,
      hospitalsByCountry,
      incidentsByCountry,
    };
  }

  async getHospitalsByCountry() {
    this.logger.log('Getting hospitals by country');
    
    const hospitals = await this.prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        country: true,
      },
    });

    const hospitalsByCountry = hospitals.reduce((acc, hospital) => {
      const country = hospital.country || 'Unknown';
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(hospital);
      return acc;
    }, {});

    return hospitalsByCountry;
  }

  async getIncidentsByCountry() {
    this.logger.log('Getting incidents by country');
    
    const incidents = await this.prisma.analyticsLog.findMany({
      where: { eventType: 'sos_report' },
      select: {
        id: true,
        metadata: true,
        timestamp: true,
      },
    });

    const incidentsByCountry = incidents.reduce((acc, incident) => {
      const country = incident.metadata['country'] || 'Unknown';
      if (!acc[country]) {
        acc[country] = 0;
      }
      acc[country]++;
      return acc;
    }, {});

    return incidentsByCountry;
  }

  async getRegionalTrends(timeframe: string = '30d') {
    this.logger.log(`Getting regional trends for timeframe: ${timeframe}`);
    
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await this.prisma.analyticsLog.groupBy({
      by: ['eventType'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
    });

    return trends.map(trend => ({
      eventType: trend.eventType,
      count: trend._count,
    }));
  }

  async getCountryPerformance(countryCode: string) {
    this.logger.log(`Getting performance metrics for country: ${countryCode}`);
    
    const country = await this.countryService.getCountryByCode(countryCode);
    if (!country) {
      throw new Error(`Country with code ${countryCode} not found`);
    }

    const hospitals = await this.prisma.hospital.count({
      where: { country: countryCode },
    });

    const incidents = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'sos_report',
        metadata: {
          path: ['country'],
          equals: countryCode,
        } as any, // MongoDB compatibility fix
      },
    });

    const responseTime = await this.getAverageResponseTime(countryCode);
    const successRate = await this.getSuccessRate(countryCode);

    return {
      country,
      hospitals,
      incidents,
      responseTime,
      successRate,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getAverageResponseTime(countryCode: string) {
    this.logger.log(`Getting average response time for country: ${countryCode}`);
    
    const incidents = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'sos_report',
        metadata: {
          path: ['country'],
          equals: countryCode,
        } as any, // MongoDB compatibility fix
      },
      select: {
        metadata: true,
        timestamp: true,
      },
    });

    if (incidents.length === 0) {
      return 0;
    }

    const responseTimes = incidents
      .map(incident => {
        const responseTime = incident.metadata['responseTime'];
        return responseTime ? parseInt(responseTime) : null;
      })
      .filter(time => time !== null);

    if (responseTimes.length === 0) {
      return 0;
    }

    const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(average);
  }

  async getSuccessRate(countryCode: string) {
    this.logger.log(`Getting success rate for country: ${countryCode}`);
    
    const totalIncidents = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'sos_report',
        metadata: {
          path: ['country'],
          equals: countryCode,
        } as any, // MongoDB compatibility fix
      },
    });

    const successfulIncidents = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'sos_report',
        metadata: {
          path: ['country'],
          equals: countryCode,
        } as any, // MongoDB compatibility fix
      },
    });

    if (totalIncidents === 0) {
      return 0;
    }

    return Math.round((successfulIncidents / totalIncidents) * 100);
  }

  async getRegionalAlerts() {
    this.logger.log('Getting regional alerts');
    
    const alerts = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'regional_alert',
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return alerts.map(alert => ({
      id: alert.id,
      ...(alert.metadata as any || {}),
      timestamp: alert.timestamp,
    }));
  }

  async createRegionalAlert(alertData: any) {
    this.logger.log(`Creating regional alert: ${alertData.title}`);
    
    const alert = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'regional_alert',
        metadata: {
          title: alertData.title,
          description: alertData.description,
          severity: alertData.severity,
          countries: alertData.countries,
          alertType: alertData.alertType,
          createdBy: alertData.createdBy,
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Regional alert created with ID: ${alert.id}`);
    return {
      id: alert.id,
      ...(alert.metadata as any || {}),
      timestamp: alert.timestamp,
    };
  }

  async getRegionalDashboard() {
    this.logger.log('Getting regional dashboard data');
    
    const [
      overview,
      statistics,
      trends,
      alerts,
    ] = await Promise.all([
      this.getRegionalOverview(),
      this.getRegionalStatistics(),
      this.getRegionalTrends(),
      this.getRegionalAlerts(),
    ]);

    return {
      overview,
      statistics,
      trends,
      alerts,
      lastUpdated: new Date().toISOString(),
    };
  }
}

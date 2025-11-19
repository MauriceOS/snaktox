import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PartnershipService {
  private readonly logger = new Logger(PartnershipService.name);

  // Strategic partnerships for SnaKTox
  private readonly partnerships = {
    WHO: {
      id: 'WHO',
      name: 'World Health Organization',
      type: 'international_organization',
      status: 'active',
      countries: ['KE', 'TZ', 'UG', 'RW', 'ET'],
      focus: 'Global health standards and snakebite guidelines',
      contact: {
        email: 'snakebite@who.int',
        phone: '+41-22-791-2111',
        website: 'https://www.who.int/health-topics/snakebite',
      },
      agreements: [
        'Data sharing agreement for snakebite statistics',
        'Technical cooperation on antivenom standards',
        'Training and capacity building programs',
      ],
      lastUpdated: '2024-01-01',
    },
    CDC: {
      id: 'CDC',
      name: 'Centers for Disease Control and Prevention',
      type: 'government_agency',
      status: 'active',
      countries: ['KE', 'TZ', 'UG'],
      focus: 'Public health surveillance and emergency response',
      contact: {
        email: 'globalhealth@cdc.gov',
        phone: '+1-404-639-7000',
        website: 'https://www.cdc.gov/globalhealth',
      },
      agreements: [
        'Epidemiological data sharing',
        'Emergency response protocols',
        'Public health training programs',
      ],
      lastUpdated: '2024-01-01',
    },
    KEMRI: {
      id: 'KEMRI',
      name: 'Kenya Medical Research Institute',
      type: 'research_institute',
      status: 'active',
      countries: ['KE'],
      focus: 'Local research and snakebite data collection',
      contact: {
        email: 'info@kemri.org',
        phone: '+254-20-272-2541',
        website: 'https://www.kemri.org',
      },
      agreements: [
        'Local snake species research',
        'Antivenom effectiveness studies',
        'Community health programs',
      ],
      lastUpdated: '2024-01-01',
    },
    MOH_KE: {
      id: 'MOH_KE',
      name: 'Ministry of Health Kenya',
      type: 'government_ministry',
      status: 'active',
      countries: ['KE'],
      focus: 'National health policy and hospital network',
      contact: {
        email: 'info@health.go.ke',
        phone: '+254-20-271-7077',
        website: 'https://www.health.go.ke',
      },
      agreements: [
        'Hospital network integration',
        'Health policy alignment',
        'Emergency response coordination',
      ],
      lastUpdated: '2024-01-01',
    },
    MOH_TZ: {
      id: 'MOH_TZ',
      name: 'Ministry of Health Tanzania',
      type: 'government_ministry',
      status: 'pending',
      countries: ['TZ'],
      focus: 'National health policy and hospital network',
      contact: {
        email: 'info@moh.go.tz',
        phone: '+255-22-211-0000',
        website: 'https://www.moh.go.tz',
      },
      agreements: [
        'Hospital network integration (pending)',
        'Health policy alignment (pending)',
        'Emergency response coordination (pending)',
      ],
      lastUpdated: '2024-01-01',
    },
    MOH_UG: {
      id: 'MOH_UG',
      name: 'Ministry of Health Uganda',
      type: 'government_ministry',
      status: 'pending',
      countries: ['UG'],
      focus: 'National health policy and hospital network',
      contact: {
        email: 'info@health.go.ug',
        phone: '+256-41-425-0000',
        website: 'https://www.health.go.ug',
      },
      agreements: [
        'Hospital network integration (pending)',
        'Health policy alignment (pending)',
        'Emergency response coordination (pending)',
      ],
      lastUpdated: '2024-01-01',
    },
    AMREF: {
      id: 'AMREF',
      name: 'African Medical and Research Foundation',
      type: 'ngo',
      status: 'active',
      countries: ['KE', 'TZ', 'UG'],
      focus: 'Community health and emergency response',
      contact: {
        email: 'info@amref.org',
        phone: '+254-20-699-3000',
        website: 'https://www.amref.org',
      },
      agreements: [
        'Community health worker training',
        'Emergency response coordination',
        'Health education programs',
      ],
      lastUpdated: '2024-01-01',
    },
    RED_CROSS: {
      id: 'RED_CROSS',
      name: 'Red Cross Society',
      type: 'ngo',
      status: 'active',
      countries: ['KE', 'TZ', 'UG', 'RW'],
      focus: 'Emergency response and first aid training',
      contact: {
        email: 'info@redcross.or.ke',
        phone: '+254-20-395-0000',
        website: 'https://www.redcross.or.ke',
      },
      agreements: [
        'First aid training programs',
        'Emergency response coordination',
        'Community awareness campaigns',
      ],
      lastUpdated: '2024-01-01',
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getAllPartnerships() {
    this.logger.log('Getting all partnerships');
    
    return Object.values(this.partnerships);
  }

  async getActivePartnerships() {
    this.logger.log('Getting active partnerships');
    
    return Object.values(this.partnerships).filter(partnership => partnership.status === 'active');
  }

  async getPartnershipById(id: string) {
    this.logger.log(`Getting partnership by ID: ${id}`);
    
    const partnership = this.partnerships[id.toUpperCase()];
    if (!partnership) {
      throw new Error(`Partnership with ID ${id} not found`);
    }
    
    return partnership;
  }

  async getPartnershipsByCountry(countryCode: string) {
    this.logger.log(`Getting partnerships by country: ${countryCode}`);
    
    return Object.values(this.partnerships).filter(partnership => 
      partnership.countries.includes(countryCode.toUpperCase())
    );
  }

  async getPartnershipsByType(type: string) {
    this.logger.log(`Getting partnerships by type: ${type}`);
    
    return Object.values(this.partnerships).filter(partnership => 
      partnership.type === type
    );
  }

  async updatePartnershipStatus(id: string, status: string) {
    this.logger.log(`Updating partnership status: ${id} to ${status}`);
    
    const partnership = this.partnerships[id.toUpperCase()];
    if (!partnership) {
      throw new Error(`Partnership with ID ${id} not found`);
    }

    const oldStatus = partnership.status;
    partnership.status = status;
    partnership.lastUpdated = new Date().toISOString();

    // Log status change
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'partnership_status_change',
        metadata: {
          partnershipId: id,
          partnershipName: partnership.name,
          oldStatus,
          newStatus: status,
          changedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Partnership ${id} status updated from ${oldStatus} to ${status}`);
    return partnership;
  }

  async addPartnershipAgreement(partnershipId: string, agreement: string) {
    this.logger.log(`Adding agreement to partnership: ${partnershipId}`);
    
    const partnership = this.partnerships[partnershipId.toUpperCase()];
    if (!partnership) {
      throw new Error(`Partnership with ID ${partnershipId} not found`);
    }

    partnership.agreements.push(agreement);
    partnership.lastUpdated = new Date().toISOString();

    // Log agreement addition
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'partnership_agreement_added',
        metadata: {
          partnershipId,
          partnershipName: partnership.name,
          agreement,
          addedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Agreement added to partnership ${partnershipId}`);
    return partnership;
  }

  async getPartnershipStatistics() {
    this.logger.log('Getting partnership statistics');
    
    const totalPartnerships = Object.keys(this.partnerships).length;
    const activePartnerships = Object.values(this.partnerships).filter(p => p.status === 'active').length;
    const pendingPartnerships = Object.values(this.partnerships).filter(p => p.status === 'pending').length;
    
    const partnershipsByType = Object.values(this.partnerships).reduce((acc, partnership) => {
      if (!acc[partnership.type]) {
        acc[partnership.type] = 0;
      }
      acc[partnership.type]++;
      return acc;
    }, {});

    const partnershipsByCountry = {};
    Object.values(this.partnerships).forEach(partnership => {
      partnership.countries.forEach(country => {
        if (!partnershipsByCountry[country]) {
          partnershipsByCountry[country] = 0;
        }
        partnershipsByCountry[country]++;
      });
    });

    return {
      totalPartnerships,
      activePartnerships,
      pendingPartnerships,
      partnershipsByType,
      partnershipsByCountry,
    };
  }

  async getPartnershipImpact() {
    this.logger.log('Getting partnership impact metrics');
    
    const impact = {
      dataSharing: {
        totalAgreements: 0,
        activeAgreements: 0,
        dataPoints: 0,
      },
      training: {
        totalPrograms: 0,
        participants: 0,
        countries: 0,
      },
      emergencyResponse: {
        totalIncidents: 0,
        responseTime: 0,
        successRate: 0,
      },
    };

    // Calculate data sharing impact
    Object.values(this.partnerships).forEach(partnership => {
      if (partnership.status === 'active') {
        impact.dataSharing.totalAgreements += partnership.agreements.length;
        impact.dataSharing.activeAgreements += partnership.agreements.length;
      }
    });

    // Calculate training impact
    const trainingPartnerships = Object.values(this.partnerships).filter(p => 
      p.agreements.some(agreement => agreement.includes('training'))
    );
    impact.training.totalPrograms = trainingPartnerships.length;
    impact.training.countries = new Set(
      trainingPartnerships.flatMap(p => p.countries)
    ).size;

    // Calculate emergency response impact
    const emergencyPartnerships = Object.values(this.partnerships).filter(p => 
      p.agreements.some(agreement => agreement.includes('emergency'))
    );
    impact.emergencyResponse.totalIncidents = emergencyPartnerships.length;

    return impact;
  }

  async createPartnershipMeeting(partnershipId: string, meetingData: any) {
    this.logger.log(`Creating partnership meeting for: ${partnershipId}`);
    
    const partnership = this.partnerships[partnershipId.toUpperCase()];
    if (!partnership) {
      throw new Error(`Partnership with ID ${partnershipId} not found`);
    }

    const meeting = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'partnership_meeting',
        metadata: {
          partnershipId,
          partnershipName: partnership.name,
          meetingType: meetingData.type,
          agenda: meetingData.agenda,
          participants: meetingData.participants,
          scheduledDate: meetingData.scheduledDate,
          location: meetingData.location,
          objectives: meetingData.objectives,
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Partnership meeting created with ID: ${meeting.id}`);
    return {
      id: meeting.id,
      ...(meeting.metadata as any || {}),
      timestamp: meeting.timestamp,
    };
  }

  async getPartnershipMeetings(partnershipId?: string) {
    this.logger.log(`Getting partnership meetings${partnershipId ? ` for ${partnershipId}` : ''}`);
    
    const where: any = {
      eventType: 'partnership_meeting',
    };

    if (partnershipId) {
      where.metadata = {
        path: ['partnershipId'],
        equals: partnershipId,
      } as any; // MongoDB compatibility fix
    }

    const meetings = await this.prisma.analyticsLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    return meetings.map(meeting => ({
      id: meeting.id,
      ...(meeting.metadata as any || {}),
      timestamp: meeting.timestamp,
    }));
  }

  async getPartnershipDashboard() {
    this.logger.log('Getting partnership dashboard data');
    
    const [
      partnerships,
      statistics,
      impact,
      recentMeetings,
    ] = await Promise.all([
      this.getAllPartnerships(),
      this.getPartnershipStatistics(),
      this.getPartnershipImpact(),
      this.getPartnershipMeetings(),
    ]);

    return {
      partnerships,
      statistics,
      impact,
      recentMeetings: recentMeetings.slice(0, 5),
      lastUpdated: new Date().toISOString(),
    };
  }
}

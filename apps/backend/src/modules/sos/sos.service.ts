import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSosReportDto } from './dto/create-sos-report.dto';
import { UpdateSosReportDto } from './dto/update-sos-report.dto';
import { Logger } from '../../common/logger/logger.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class SosService {
  private readonly logger = new Logger();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async findAll(query: any) {
    this.logger.log('Fetching all SOS reports');
    
    const where: any = {};
    
    if (query.status) {
      where.status = query.status;
    }
    
    if (query.responderId) {
      where.responderId = query.responderId;
    }
    
    if (query.hospitalId) {
      where.hospitalId = query.hospitalId;
    }
    
    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const sosReports = await this.prisma.sOSReport.findMany({
      where,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
        snakeSpecies: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
            riskLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Found ${sosReports.length} SOS reports`);
    return sosReports;
  }

  async findActive() {
    this.logger.log('Fetching active SOS reports');
    
    const activeReports = await this.prisma.sOSReport.findMany({
      where: {
        status: {
          in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'],
        },
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
        snakeSpecies: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
            riskLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Found ${activeReports.length} active SOS reports`);
    return activeReports;
  }

  async findNearby(lat: number, lng: number, radius: number = 50) {
    this.logger.log(`Finding SOS reports near coordinates: ${lat}, ${lng} within ${radius}km`);
    
    // Using PostGIS for geospatial queries
    const nearbyReports = await this.prisma.$queryRaw`
      SELECT 
        id, "gpsCoordinates", "imageUrl", timestamp, "responderId", "hospitalId", 
        "snakeSpeciesId", status, "victimInfo", symptoms, "firstAidApplied", notes,
        ST_Distance(
          ST_GeogFromText('POINT(' || (gps_coordinates->>'lng')::float || ' ' || (gps_coordinates->>'lat')::float || ')'),
          ST_GeogFromText('POINT(${lng} ${lat})')
        ) / 1000 as distance_km
      FROM sos_reports 
      WHERE ST_DWithin(
        ST_GeogFromText('POINT(' || (gps_coordinates->>'lng')::float || ' ' || (gps_coordinates->>'lat')::float || ')'),
        ST_GeogFromText('POINT(${lng} ${lat})'),
        ${radius * 1000}
      )
      AND status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS')
      ORDER BY distance_km ASC, timestamp DESC
      LIMIT 20
    `;

    this.logger.log(`Found ${(nearbyReports as any[]).length} nearby SOS reports within ${radius}km`);
    return nearbyReports;
  }

  async getStatistics(startDate?: string, endDate?: string) {
    this.logger.log('Generating SOS report statistics');
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const totalReports = await this.prisma.sOSReport.count({ where });
    
    const statusCounts = await this.prisma.sOSReport.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where,
    });

    const riskLevelCounts = await this.prisma.sOSReport.groupBy({
      by: ['snakeSpeciesId'],
      _count: {
        id: true,
      },
      where: {
        ...where,
        snakeSpeciesId: {
          not: null,
        },
      },
    });

    // Calculate average response time manually
    const completedReports = await this.prisma.sOSReport.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });
    
    const averageResponseTime = completedReports.length > 0 
      ? completedReports.reduce((sum, report) => {
          const responseTime = report.updatedAt.getTime() - report.createdAt.getTime();
          return sum + responseTime;
        }, 0) / completedReports.length
      : 0;

    const monthlyTrends = await this.prisma.sOSReport.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    this.logger.log('SOS statistics generated');
    return {
      totalReports,
      statusCounts,
      riskLevelCounts,
      averageResponseTime: averageResponseTime,
      monthlyTrends,
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present',
      },
    };
  }

  async findOne(id: string) {
    this.logger.log(`Fetching SOS report with ID: ${id}`);
    
    const sosReport = await this.prisma.sOSReport.findUnique({
      where: { id },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
            antivenomStock: true,
          },
        },
        snakeSpecies: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
            riskLevel: true,
            venomType: {
              select: {
                name: true,
                severity: true,
                treatmentNotes: true,
              },
            },
          },
        },
      },
    });

    if (!sosReport) {
      this.logger.warn(`SOS report not found with ID: ${id}`);
      throw new NotFoundException(`SOS report with ID ${id} not found`);
    }

    this.logger.log(`SOS report found: ${sosReport.id}`);
    return sosReport;
  }

  async create(createSosReportDto: CreateSosReportDto) {
    this.logger.log('Creating new SOS report');
    
    // Validate GPS coordinates
    if (!createSosReportDto.gpsCoordinates || 
        !createSosReportDto.gpsCoordinates.lat || 
        !createSosReportDto.gpsCoordinates.lng) {
      this.logger.warn('Invalid GPS coordinates provided');
      throw new BadRequestException('Valid GPS coordinates are required');
    }

    // Find nearest hospital with antivenom
    const nearestHospital = await this.findNearestHospital(
      createSosReportDto.gpsCoordinates.lat,
      createSosReportDto.gpsCoordinates.lng
    );

    const sosReport = await this.prisma.sOSReport.create({
      data: {
        ...createSosReportDto,
        hospitalId: nearestHospital?.id,
        status: 'PENDING',
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
        snakeSpecies: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
            riskLevel: true,
          },
        },
      },
    });

    this.logger.log(`SOS report created with ID: ${sosReport.id}`);
    
    // Send emergency notifications
    await this.sendEmergencyNotifications(sosReport);
    
    // Broadcast real-time update via WebSocket
    await this.webSocketService.broadcastSosUpdate(sosReport);
    
    return sosReport;
  }

  async update(id: string, updateSosReportDto: UpdateSosReportDto) {
    this.logger.log(`Updating SOS report with ID: ${id}`);
    
    const existingSosReport = await this.prisma.sOSReport.findUnique({
      where: { id },
    });

    if (!existingSosReport) {
      this.logger.warn(`SOS report not found with ID: ${id}`);
      throw new NotFoundException(`SOS report with ID ${id} not found`);
    }

    const sosReport = await this.prisma.sOSReport.update({
      where: { id },
      data: updateSosReportDto,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
        snakeSpecies: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
            riskLevel: true,
          },
        },
      },
    });

    this.logger.log(`SOS report updated: ${sosReport.id}`);
    return sosReport;
  }

  async assignHospital(id: string, hospitalId: string) {
    this.logger.log(`Assigning hospital ${hospitalId} to SOS report ${id}`);
    
    const sosReport = await this.prisma.sOSReport.findUnique({
      where: { id },
    });

    if (!sosReport) {
      this.logger.warn(`SOS report not found with ID: ${id}`);
      throw new NotFoundException(`SOS report with ID ${id} not found`);
    }

    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      this.logger.warn(`Hospital not found with ID: ${hospitalId}`);
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found`);
    }

    const updatedSosReport = await this.prisma.sOSReport.update({
      where: { id },
      data: {
        hospitalId,
        status: 'ASSIGNED',
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
        snakeSpecies: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
            riskLevel: true,
          },
        },
      },
    });

    this.logger.log(`Hospital assigned to SOS report: ${id}`);
    
    // Send notification to assigned hospital
    await this.notifyHospital(hospital, updatedSosReport);
    
    // Broadcast real-time update via WebSocket
    await this.webSocketService.broadcastSosUpdate(updatedSosReport);
    
    return updatedSosReport;
  }

  private async findNearestHospital(lat: number, lng: number) {
    this.logger.log(`Finding nearest hospital to coordinates: ${lat}, ${lng}`);
    
    const nearestHospital = await this.prisma.$queryRaw`
      SELECT 
        id, name, location, coordinates, "verifiedStatus", "contactInfo", 
        "antivenomStock", specialties, "emergencyServices",
        ST_Distance(
          ST_GeogFromText('POINT(' || (coordinates->>'lng')::float || ' ' || (coordinates->>'lat')::float || ')'),
          ST_GeogFromText('POINT(${lng} ${lat})')
        ) / 1000 as distance_km
      FROM hospitals 
      WHERE "verifiedStatus" = 'VERIFIED'
      AND "emergencyServices" = true
      ORDER BY distance_km ASC
      LIMIT 1
    `;

    return nearestHospital[0] || null;
  }

  private async sendEmergencyNotifications(sosReport: any) {
    this.logger.log(`Sending emergency notifications for SOS report: ${sosReport.id}`);
    
    try {
      const emergencyAlert = {
        sosReportId: sosReport.id,
        hospitalId: sosReport.hospitalId,
        responderId: sosReport.responderId,
        location: sosReport.gpsCoordinates,
        snakeSpecies: sosReport.snakeSpecies?.scientificName,
        riskLevel: sosReport.snakeSpecies?.riskLevel || 'UNKNOWN',
        timestamp: sosReport.timestamp,
      };

      await this.notificationsService.sendEmergencyAlert(emergencyAlert);
      
    } catch (error) {
      this.logger.error(`Failed to send emergency notifications: ${error.message}`);
      // Don't throw error to avoid breaking the SOS report creation
    }
  }

  private async notifyHospital(hospital: any, sosReport: any) {
    this.logger.log(`Notifying hospital ${hospital.name} about SOS report: ${sosReport.id}`);
    
    try {
      const hospitalUpdate = {
        hospitalId: hospital.id,
        updateType: 'sos_assignment',
        data: {
          sosReportId: sosReport.id,
          responderId: sosReport.responderId,
          location: sosReport.gpsCoordinates,
          snakeSpecies: sosReport.snakeSpecies?.scientificName,
          riskLevel: sosReport.snakeSpecies?.riskLevel || 'UNKNOWN',
          timestamp: sosReport.timestamp,
        },
      };

      await this.notificationsService.sendHospitalUpdate(
        hospitalUpdate.hospitalId,
        hospitalUpdate.updateType,
        hospitalUpdate.data
      );
      
    } catch (error) {
      this.logger.error(`Failed to notify hospital: ${error.message}`);
      // Don't throw error to avoid breaking the hospital assignment
    }
  }
}

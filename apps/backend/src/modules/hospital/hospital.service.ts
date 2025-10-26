import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { Logger } from '../../common/logger/logger.service';

@Injectable()
export class HospitalService {
  private readonly logger = new Logger();

  constructor(private readonly prisma: PrismaService) {}

  async findAll(verified?: boolean) {
    this.logger.log('Fetching all hospitals');
    
    const where = verified !== undefined ? { verifiedStatus: verified ? 'VERIFIED' as any : 'PENDING' as any } : {};
    
    const hospitals = await this.prisma.hospital.findMany({
      where,
      include: {
        stockUpdates: {
          where: { status: 'AVAILABLE' },
          orderBy: { lastUpdated: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    this.logger.log(`Found ${hospitals.length} hospitals`);
    return hospitals;
  }

  async findOne(id: string) {
    this.logger.log(`Fetching hospital with ID: ${id}`);
    
    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        stockUpdates: {
          where: { status: 'AVAILABLE' },
          orderBy: { lastUpdated: 'desc' },
        },
        sosReports: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!hospital) {
      this.logger.warn(`Hospital not found with ID: ${id}`);
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }

    this.logger.log(`Hospital found: ${hospital.name}`);
    return hospital;
  }

  async findNearby(lat: number, lng: number, radius: number = 50) {
    this.logger.log(`Finding hospitals near coordinates: ${lat}, ${lng} within ${radius}km`);
    
    // Using PostGIS for geospatial queries
    const hospitals = await this.prisma.$queryRaw`
      SELECT 
        id, name, location, coordinates, "verifiedStatus", "contactInfo", 
        "antivenomStock", specialties, "operatingHours", "emergencyServices",
        ST_Distance(
          ST_GeogFromText('POINT(' || (coordinates->>'lng')::float || ' ' || (coordinates->>'lat')::float || ')'),
          ST_GeogFromText('POINT(${lng} ${lat})')
        ) / 1000 as distance_km
      FROM hospitals 
      WHERE ST_DWithin(
        ST_GeogFromText('POINT(' || (coordinates->>'lng')::float || ' ' || (coordinates->>'lat')::float || ')'),
        ST_GeogFromText('POINT(${lng} ${lat})'),
        ${radius * 1000}
      )
      AND "verifiedStatus" = 'VERIFIED'
      ORDER BY distance_km ASC
      LIMIT 20
    `;

    this.logger.log(`Found ${(hospitals as any[]).length} hospitals within ${radius}km`);
    return hospitals;
  }

  async create(createHospitalDto: CreateHospitalDto) {
    this.logger.log('Creating new hospital');
    
    const hospital = await this.prisma.hospital.create({
      data: {
        ...createHospitalDto,
        verifiedStatus: 'PENDING', // New hospitals start as pending verification
      },
    });

    this.logger.log(`Hospital created with ID: ${hospital.id}`);
    return hospital;
  }
}

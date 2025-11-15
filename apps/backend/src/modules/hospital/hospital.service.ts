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
    
    // MongoDB geospatial query using aggregation
    // Get all verified hospitals and calculate distance client-side
    const hospitals = await this.prisma.hospital.findMany({
      where: {
        verifiedStatus: 'VERIFIED',
      },
    });

    // Calculate distance and filter
    const nearbyHospitals = hospitals
      .map(hospital => {
        const coords = hospital.coordinates as { lat: number; lng: number };
        const distance = this.calculateDistance(lat, lng, coords.lat, coords.lng);
        return {
          ...hospital,
          distance_km: distance,
        };
      })
      .filter(hospital => hospital.distance_km <= radius)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 20);

    this.logger.log(`Found ${nearbyHospitals.length} hospitals within ${radius}km`);
    return nearbyHospitals;
  }

  // Haversine formula to calculate distance between two coordinates
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
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

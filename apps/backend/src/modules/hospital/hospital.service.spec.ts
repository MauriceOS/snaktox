import { Test, TestingModule } from '@nestjs/testing';
import { HospitalService } from './hospital.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('HospitalService', () => {
  let service: HospitalService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HospitalService,
        {
          provide: PrismaService,
          useValue: {
            hospital: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HospitalService>(HospitalService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all hospitals', async () => {
      const mockHospitals = [
        {
          id: '1',
          name: 'Test Hospital',
          location: 'Test Location',
          country: 'KE',
          coordinates: { lat: -1.3048, lng: 36.8156 },
          verifiedStatus: 'VERIFIED' as any,
          contactInfo: { phone: '+254-20-2726300', emergency: '+254-20-2726300', email: 'test@hospital.com' },
          antivenomStock: { polyvalent: 25, monovalent: 15, lastUpdated: '2024-01-10' },
          specialties: ['Emergency Medicine', 'Toxicology'],
          operatingHours: { emergency: '24/7', general: '08:00-17:00' },
          emergencyServices: true,
          source: 'Test Data',
          lastVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prismaService.hospital, 'findMany').mockResolvedValue(mockHospitals);

      const result = await service.findAll();

      expect(result).toEqual(mockHospitals);
      expect(prismaService.hospital.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          stockUpdates: {
            where: { status: 'AVAILABLE' },
            orderBy: { lastUpdated: 'desc' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by verified status', async () => {
      const mockHospitals = [];
      jest.spyOn(prismaService.hospital, 'findMany').mockResolvedValue(mockHospitals);

      await service.findAll(true);

      expect(prismaService.hospital.findMany).toHaveBeenCalledWith({
        where: { verifiedStatus: 'VERIFIED' },
        include: {
          stockUpdates: {
            where: { status: 'AVAILABLE' },
            orderBy: { lastUpdated: 'desc' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a hospital by id', async () => {
      const mockHospital = {
        id: '1',
        name: 'Test Hospital',
        location: 'Test Location',
        country: 'KE',
        coordinates: { lat: -1.3048, lng: 36.8156 },
        verifiedStatus: 'VERIFIED' as any,
        contactInfo: { phone: '+254-20-2726300', emergency: '+254-20-2726300', email: 'test@hospital.com' },
        antivenomStock: { polyvalent: 25, monovalent: 15, lastUpdated: '2024-01-10' },
        specialties: ['Emergency Medicine', 'Toxicology'],
        operatingHours: { emergency: '24/7', general: '08:00-17:00' },
        emergencyServices: true,
        source: 'Test Data',
        lastVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.hospital, 'findUnique').mockResolvedValue(mockHospital);

      const result = await service.findOne('1');

      expect(result).toEqual(mockHospital);
      expect(prismaService.hospital.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
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
    });

    it('should throw NotFoundException when hospital not found', async () => {
      jest.spyOn(prismaService.hospital, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findNearby', () => {
    it('should return nearby hospitals', async () => {
      const mockNearbyHospitals = [
        {
          id: '1',
          name: 'Nearby Hospital',
          distance_km: 5.2,
        },
      ];

      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue(mockNearbyHospitals);

      const result = await service.findNearby(-1.3048, 36.8156, 50);

      expect(result).toEqual(mockNearbyHospitals);
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new hospital', async () => {
      const createHospitalDto = {
        name: 'New Hospital',
        location: 'New Location',
        country: 'KE',
        coordinates: { lat: -1.3048, lng: 36.8156 },
        contactInfo: {
          phone: '+254-20-2726300',
          emergency: '+254-20-2726300',
          email: 'new@hospital.com',
        },
        antivenomStock: {
          polyvalent: 25,
          monovalent: 15,
          lastUpdated: '2024-01-10',
        },
        specialties: ['Emergency Medicine'],
        operatingHours: {
          emergency: '24/7',
          general: '08:00-17:00',
        },
        source: 'Test Data',
      };

      const mockCreatedHospital = {
        id: '1',
        ...createHospitalDto,
        verifiedStatus: 'PENDING' as any,
        emergencyServices: true,
        lastVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.hospital, 'create').mockResolvedValue(mockCreatedHospital);

      const result = await service.create(createHospitalDto);

      expect(result).toEqual(mockCreatedHospital);
      expect(prismaService.hospital.create).toHaveBeenCalledWith({
        data: {
          ...createHospitalDto,
          verifiedStatus: 'PENDING',
        },
      });
    });
  });
});

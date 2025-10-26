import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Stock (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testHospitalId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // Create test hospital
    const hospital = await prismaService.hospital.create({
      data: {
        name: 'Test Hospital',
        location: 'Test Location',
        country: 'KE',
        coordinates: { lat: -1.3048, lng: 36.8156 },
        verifiedStatus: 'VERIFIED',
        contactInfo: {
          phone: '+254-20-2726300',
          emergency: '+254-20-2726300',
          email: 'test@hospital.com',
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
        emergencyServices: true,
        source: 'Test Data',
      },
    });

    testHospitalId = hospital.id;

    // Create test stock update
    await prismaService.stockUpdate.create({
      data: {
        hospitalId: testHospitalId,
        antivenomType: 'Polyvalent Antivenom (SAIMR)',
        quantity: 25,
        expiryDate: new Date('2024-12-31'),
        batchNumber: 'SAIMR-2024-001',
        supplier: 'South African Institute for Medical Research',
        status: 'AVAILABLE',
      },
    });
  });

  afterEach(async () => {
    await prismaService.stockUpdate.deleteMany();
    await prismaService.hospital.deleteMany();
    await app.close();
  });

  it('/stock (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/stock')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('antivenomType');
        expect(res.body[0]).toHaveProperty('quantity');
        expect(res.body[0]).toHaveProperty('status');
      });
  });

  it('/stock/hospital/:hospitalId (GET)', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/stock/hospital/${testHospitalId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/stock/low-stock (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/stock/low-stock?threshold=30')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/stock/expired (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/stock/expired')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/stock (POST)', () => {
    const newStockUpdate = {
      hospitalId: testHospitalId,
      antivenomType: 'Monovalent Antivenom',
      quantity: 15,
      expiryDate: '2024-12-31T00:00:00.000Z',
      batchNumber: 'MONO-2024-001',
      supplier: 'Test Supplier',
    };

    return request(app.getHttpServer())
      .post('/api/v1/stock')
      .send(newStockUpdate)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('antivenomType', newStockUpdate.antivenomType);
        expect(res.body).toHaveProperty('quantity', newStockUpdate.quantity);
        expect(res.body).toHaveProperty('status', 'AVAILABLE');
      });
  });
});

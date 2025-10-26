import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Hospitals (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // Seed test data
    await prismaService.hospital.create({
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
        specialties: ['Emergency Medicine', 'Toxicology'],
        operatingHours: {
          emergency: '24/7',
          general: '08:00-17:00',
        },
        emergencyServices: true,
        source: 'Test Data',
      },
    });
  });

  afterEach(async () => {
    await prismaService.hospital.deleteMany();
    await app.close();
  });

  it('/hospitals (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/hospitals')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('location');
        expect(res.body[0]).toHaveProperty('verifiedStatus');
      });
  });

  it('/hospitals/nearby (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/hospitals/nearby?lat=-1.3048&lng=36.8156&radius=50')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/hospitals/:id (GET)', async () => {
    const hospital = await prismaService.hospital.findFirst();
    
    return request(app.getHttpServer())
      .get(`/api/v1/hospitals/${hospital.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', hospital.id);
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('location');
      });
  });

  it('/hospitals (POST)', () => {
    const newHospital = {
      name: 'New Test Hospital',
      location: 'New Test Location',
      coordinates: { lat: -1.3048, lng: 36.8156 },
      contactInfo: {
        phone: '+254-20-2726300',
        emergency: '+254-20-2726300',
        email: 'new@hospital.com',
      },
      antivenomStock: {
        polyvalent: 20,
        monovalent: 10,
        lastUpdated: '2024-01-10',
      },
      specialties: ['Emergency Medicine'],
      operatingHours: {
        emergency: '24/7',
        general: '08:00-17:00',
      },
      source: 'Test Data',
    };

    return request(app.getHttpServer())
      .post('/api/v1/hospitals')
      .send(newHospital)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', newHospital.name);
        expect(res.body).toHaveProperty('verifiedStatus', 'PENDING');
      });
  });
});

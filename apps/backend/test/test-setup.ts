import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { AppModule } from '../src/app.module';

export let app: INestApplication;
export let prismaService: PrismaService;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  prismaService = moduleFixture.get<PrismaService>(PrismaService);
  
  await app.init();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  // Clean up database before each test
  await prismaService.sOSReport.deleteMany();
  await prismaService.stockUpdate.deleteMany();
  await prismaService.educationMaterial.deleteMany();
  await prismaService.analyticsLog.deleteMany();
  await prismaService.snakeSpecies.deleteMany();
  await prismaService.venomType.deleteMany();
  await prismaService.hospital.deleteMany();
});

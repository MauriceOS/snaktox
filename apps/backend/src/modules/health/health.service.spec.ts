import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when database is connected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('database', 'connected');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return error status when database is disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));

      const result = await service.check();

      expect(result).toHaveProperty('status', 'error');
      expect(result).toHaveProperty('database', 'disconnected');
      expect(result).toHaveProperty('error');
    });
  });

  describe('ready', () => {
    it('should return ready status when all services are ready', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.ready();

      expect(result).toHaveProperty('status', 'ready');
      expect(result).toHaveProperty('services');
      expect(result.services).toHaveProperty('database', 'ready');
      expect(result.services).toHaveProperty('api', 'ready');
    });

    it('should return not ready status when database is not ready', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));

      const result = await service.ready();

      expect(result).toHaveProperty('status', 'not ready');
      expect(result).toHaveProperty('services');
      expect(result.services).toHaveProperty('database', 'not ready');
      expect(result.services).toHaveProperty('api', 'ready');
    });
  });
});

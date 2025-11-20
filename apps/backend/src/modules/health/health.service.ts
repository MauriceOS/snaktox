import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      // Check database connection using simple Prisma query
      await this.prisma.analyticsLog.findFirst();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: 'disconnected',
      };
    }
  }

  async ready() {
    try {
      // Check if all required services are ready
      await this.prisma.analyticsLog.findFirst();
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ready',
          api: 'ready',
        },
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          database: 'not ready',
          api: 'ready',
        },
      };
    }
  }

  async seedDatabase() {
    try {
      this.logger.log('Starting database seeding via API...');
      
      // Import and execute the seed logic directly
      // This avoids needing ts-node in production
      const seedData = await this.executeSeedLogic();
      
      this.logger.log('Database seeding completed successfully');
      
      return {
        status: 'success',
        message: 'Database seeded successfully',
        timestamp: new Date().toISOString(),
        data: seedData,
      };
    } catch (error) {
      this.logger.error('Database seeding failed:', error.message);
      return {
        status: 'error',
        message: 'Database seeding failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async executeSeedLogic() {
    // Import seed data files
    const seedPath = path.join(process.cwd(), 'prisma/seed');
    const snakesFile = JSON.parse(
      fs.readFileSync(path.join(seedPath, 'snakes.json'), 'utf8')
    );
    const hospitalsFile = JSON.parse(
      fs.readFileSync(path.join(seedPath, 'hospitals.json'), 'utf8')
    );
    const educationFile = JSON.parse(
      fs.readFileSync(path.join(seedPath, 'education.json'), 'utf8')
    );

    const snakesData = snakesFile.snakeSpecies || [];
    const hospitalsData = hospitalsFile.hospitals || [];
    const educationData = educationFile.educationMaterials || [];

    const results = {
      venomTypes: 0,
      snakes: 0,
      hospitals: 0,
      education: 0,
      aiModels: 0,
      users: 0,
    };

    // Clear existing data (with error handling for MongoDB replica set)
    this.logger.log('Clearing existing data...');
    try {
      await this.prisma.sOSReport.deleteMany({});
      await this.prisma.stockUpdate.deleteMany({});
      await this.prisma.snakeSpecies.deleteMany({});
      await this.prisma.hospital.deleteMany({});
      await this.prisma.venomType.deleteMany({});
      await this.prisma.educationMaterial.deleteMany({});
      await this.prisma.analyticsLog.deleteMany({});
      await this.prisma.aIModel.deleteMany({});
      await this.prisma.userSession.deleteMany({});
      await this.prisma.user.deleteMany({});
    } catch (error: any) {
      if (error.code === 'P2031') {
        this.logger.warn('MongoDB replica set not configured. Skipping data clearing.');
      } else {
        throw error;
      }
    }

    // Seed VenomTypes
    this.logger.log('Seeding venom types...');
    const venomTypes = [
      {
        name: 'Neurotoxic',
        severity: 'SEVERE' as const,
        treatmentNotes: 'Requires immediate antivenom administration. Monitor respiratory function.',
        antivenomType: 'Polyvalent Antivenom',
        source: 'WHO Guidelines',
      },
      {
        name: 'Hemotoxic',
        severity: 'MODERATE' as const,
        treatmentNotes: 'Monitor blood clotting. May require blood transfusions.',
        antivenomType: 'Specific Antivenom',
        source: 'CDC Guidelines',
      },
      {
        name: 'Cytotoxic',
        severity: 'MILD' as const,
        treatmentNotes: 'Local tissue damage. Clean wound and monitor for infection.',
        antivenomType: 'Supportive Care',
        source: 'KEMRI Guidelines',
      },
    ];

    const venomMap: Record<string, string> = {};
    for (const venomType of venomTypes) {
      const vt = await this.prisma.venomType.create({
        data: venomType as any,
      });
      venomMap[vt.name.toLowerCase()] = vt.id;
      results.venomTypes++;
    }

    // Seed SnakeSpecies
    this.logger.log('Seeding snake species...');
    for (const snake of snakesData) {
      const venomKey = (snake.venomType || 'neurotoxic').toString().toLowerCase();
      const venomTypeId = venomMap[venomKey] || Object.values(venomMap)[0];

      await this.prisma.snakeSpecies.create({
        data: {
          scientificName: snake.scientificName,
          commonName: snake.commonName,
          localNames: snake.localNames || [],
          region: snake.region || 'East Africa',
          riskLevel: ((snake.riskLevel as string) || 'MODERATE') as any,
          imageUrl: snake.imageUrl || null,
          description: snake.description || null,
          habitat: snake.habitat || null,
          behavior: snake.behavior || null,
          source: snake.source || 'KEMRI',
          venomTypeId: venomTypeId,
        } as any,
      });
      results.snakes++;
    }

    // Seed Hospitals
    this.logger.log('Seeding hospitals...');
    for (const hospital of hospitalsData) {
      await this.prisma.hospital.create({
        data: {
          name: hospital.name,
          location: hospital.location || hospital.address,
          country: hospital.country || 'KE',
          coordinates: hospital.coordinates || { lat: 0, lng: 0 },
          verifiedStatus: ((hospital.verifiedStatus as string) || 'PENDING') as any,
          contactInfo: {
            phone: hospital.phone || '',
            email: hospital.email || '',
            emergencyContact: hospital.emergencyContact || hospital.phone || '',
          },
          antivenomStock: hospital.antivenomStock || {
            polyvalent: hospital.antivenomTypes?.includes('Polyvalent') ? 50 : 0,
            specific: hospital.antivenomTypes?.includes('Specific') ? 30 : 0,
            lastUpdated: new Date(),
          },
          specialties: hospital.specialties || ['Emergency Medicine', 'Toxicology'],
          operatingHours: hospital.operatingHours || {
            Monday: '24/7',
            Tuesday: '24/7',
            Wednesday: '24/7',
            Thursday: '24/7',
            Friday: '24/7',
            Saturday: '24/7',
            Sunday: '24/7',
          },
          emergencyServices: hospital.emergencyServices !== undefined ? hospital.emergencyServices : true,
          source: hospital.source || 'Ministry of Health',
        } as any,
      });
      results.hospitals++;
    }

    // Seed Education Materials
    this.logger.log('Seeding education materials...');
    for (const material of educationData) {
      await this.prisma.educationMaterial.create({
        data: {
          title: material.title,
          content: material.content,
          category: material.category || material.type || 'awareness',
          language: material.language || 'en',
          source: material.source || 'WHO',
          author: material.author || null,
          metadata: {
            imageUrl: material.imageUrl || null,
            videoUrl: material.videoUrl || null,
            readingTime: material.readingTime || '5 min',
          },
          isActive: material.isActive !== undefined ? material.isActive : true,
        },
      });
      results.education++;
    }

    // Seed AI Models
    this.logger.log('Seeding AI models...');
    const aiModels = [
      {
        name: 'snake_classifier',
        version: '1.0.0',
        accuracy: 0.94,
        trainingDataSource: 'WHO Snake Database + KEMRI Local Species',
        lastTrained: new Date(),
        isActive: true,
      },
      {
        name: 'chatbot',
        version: '1.0.0',
        accuracy: 0.87,
        trainingDataSource: 'Medical Literature + CDC Guidelines',
        lastTrained: new Date(),
        isActive: true,
      },
    ];

    for (const model of aiModels) {
      await this.prisma.aIModel.create({
        data: model,
      });
      results.aiModels++;
    }

    // Seed Sample User
    this.logger.log('Seeding sample user...');
    await this.prisma.user.create({
      data: {
        email: 'admin@snaktox.org',
        username: 'admin',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvq.ThcS', // "password123" hashed
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+254700000000',
        role: 'SYSTEM_ADMIN' as any,
        isVerified: true,
        isActive: true,
      },
    });
    results.users++;

    return results;
  }
}

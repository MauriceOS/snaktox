import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Load seed data using process.cwd() for better compatibility
    const snakesFile = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'prisma/seed/snakes.json'), 'utf8')
    );
    const hospitalsFile = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'prisma/seed/hospitals.json'), 'utf8')
    );
    const educationFile = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'prisma/seed/education.json'), 'utf8')
    );

    const snakesData = snakesFile.snakeSpecies || [];
    const hospitalsData = hospitalsFile.hospitals || [];
    const educationData = educationFile.educationMaterials || [];

    // Clear existing data (optional - use carefully in production)
    // Note: For MongoDB, deleteMany operations don't require transactions
    // If you get replica set errors, MongoDB needs to be configured as replica set
    console.log('🗑️ Clearing existing data...');
    try {
      await prisma.sOSReport.deleteMany({});
      await prisma.stockUpdate.deleteMany({});
      await prisma.snakeSpecies.deleteMany({});
      await prisma.hospital.deleteMany({});
      await prisma.venomType.deleteMany({});
      await prisma.educationMaterial.deleteMany({});
      await prisma.analyticsLog.deleteMany({});
      await prisma.aIModel.deleteMany({});
      await prisma.userSession.deleteMany({});
      await prisma.user.deleteMany({});
    } catch (error: any) {
      if (error.code === 'P2031') {
        console.warn('⚠️  MongoDB replica set not configured. Skipping data clearing.');
        console.warn('   To fix: See docs/MONGODB_REPLICA_SET_SETUP.md');
      } else {
        throw error;
      }
    }

    // Seed VenomTypes first (required by SnakeSpecies)
    console.log('📝 Seeding venom types...');
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
      const vt = await prisma.venomType.create({
        data: venomType as any,
      });
      venomMap[vt.name.toLowerCase()] = vt.id;
      console.log(`✅ Created venom type: ${vt.name}`);
    }

    // Seed SnakeSpecies
    console.log('🐍 Seeding snake species...');
    for (const snake of snakesData) {
      // Resolve venom type name to id
      const venomKey = (snake.venomType || 'neurotoxic').toString().toLowerCase();
      const venomTypeId = venomMap[venomKey] || Object.values(venomMap)[0];

      const snakeData = {
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
      };

      await prisma.snakeSpecies.create({
        data: snakeData as any,
      });
      console.log(`✅ Created snake species: ${snake.commonName}`);
    }

    // Seed Hospitals
    console.log('🏥 Seeding hospitals...');
    for (const hospital of hospitalsData) {
      const hospitalData = {
        name: hospital.name,
        location: hospital.location || hospital.address, // Map address to location
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
      };

      await prisma.hospital.create({
        data: hospitalData as any,
      });
      console.log(`✅ Created hospital: ${hospital.name}`);
    }

    // Seed Education Materials
    console.log('📚 Seeding education materials...');
    for (const material of educationData) {
      const materialData = {
        title: material.title,
        content: material.content,
        category: material.category || material.type || 'awareness', // Map type to category
        language: material.language || 'en',
        source: material.source || 'WHO',
        author: material.author || null,
        metadata: {
          imageUrl: material.imageUrl || null,
          videoUrl: material.videoUrl || null,
          readingTime: material.readingTime || '5 min',
        },
        isActive: material.isActive !== undefined ? material.isActive : true,
      };

      await prisma.educationMaterial.create({
        data: materialData,
      });
      console.log(`✅ Created education material: ${material.title}`);
    }

    // Seed AI Models
    console.log('🤖 Seeding AI models...');
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
      await prisma.aIModel.create({
        data: model,
      });
      console.log(`✅ Created AI model: ${model.name}`);
    }

    // Seed Sample User
    console.log('👤 Seeding sample user...');
    const sampleUser = await prisma.user.create({
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
    console.log(`✅ Created user: ${sampleUser.email}`);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
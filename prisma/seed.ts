import { PrismaClient, Severity } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Load seed data
    const snakesFile = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'seed/snakes.json'), 'utf8')
    );
    const hospitalsFile = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'seed/hospitals.json'), 'utf8')
    );
    const educationFile = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'seed/education.json'), 'utf8')
    );

    const snakesData = snakesFile.snakeSpecies || [];
    const hospitalsData = hospitalsFile.hospitals || [];
    const educationData = educationFile.educationMaterials || [];

    // Seed VenomTypes first (required by SnakeSpecies)
    console.log('📝 Seeding venom types...');
    const venomTypes = [
      {
        id: 'neurotoxic',
        name: 'Neurotoxic',
        severity: Severity.SEVERE,
        treatmentNotes: 'Requires immediate antivenom administration. Monitor respiratory function.',
        antivenomType: 'Polyvalent Antivenom',
        source: 'WHO Guidelines',
      },
      {
        id: 'hemotoxic',
        name: 'Hemotoxic',
        severity: Severity.MODERATE,
        treatmentNotes: 'Monitor blood clotting. May require blood transfusions.',
        antivenomType: 'Specific Antivenom',
        source: 'CDC Guidelines',
      },
      {
        id: 'cytotoxic',
        name: 'Cytotoxic',
        severity: Severity.MILD,
        treatmentNotes: 'Local tissue damage. Clean wound and monitor for infection.',
        antivenomType: 'Supportive Care',
        source: 'KEMRI Guidelines',
      },
    ];

    for (const venomType of venomTypes) {
      await prisma.venomType.upsert({
        where: { id: venomType.id },
        update: venomType,
        create: venomType,
      });
    }

    // Seed SnakeSpecies
    console.log('🐍 Seeding snake species...');
    for (const snake of snakesData) {
      // Map venomType to venomTypeId and riskLevel to enum
      const snakeData = {
        ...snake,
        venomTypeId: snake.venomType || 'neurotoxic',
        riskLevel: snake.riskLevel as any, // Will be validated by Prisma
      };
      
      // Remove the old venomType field
      delete snakeData.venomType;
      
      await prisma.snakeSpecies.upsert({
        where: { scientificName: snake.scientificName },
        update: snakeData,
        create: snakeData,
      });
    }

    // Seed Hospitals
    console.log('🏥 Seeding hospitals...');
    for (const hospital of hospitalsData) {
      // Generate ID if not present and map enums
      const hospitalData = {
        ...hospital,
        id: hospital.id || `hospital-${hospital.name.toLowerCase().replace(/\s+/g, '-')}`,
        verifiedStatus: hospital.verifiedStatus as any,
        country: hospital.country || 'KE',
      };
      
      await prisma.hospital.upsert({
        where: { id: hospitalData.id },
        update: hospitalData,
        create: hospitalData,
      });
    }

    // Seed Education Materials
    console.log('📚 Seeding education materials...');
    for (const material of educationData) {
      // Generate ID if not present
      const materialData = {
        ...material,
        id: material.id || `education-${material.title.toLowerCase().replace(/\s+/g, '-')}`,
      };
      
      await prisma.educationMaterial.upsert({
        where: { id: materialData.id },
        update: materialData,
        create: materialData,
      });
    }

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

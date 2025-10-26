import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEducationMaterialDto } from './dto/create-education-material.dto';
import { UpdateEducationMaterialDto } from './dto/update-education-material.dto';
import { Logger } from '../../common/logger/logger.service';

@Injectable()
export class EducationService {
  private readonly logger = new Logger();

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    this.logger.log('Fetching all education materials');
    
    const where: any = {
      isActive: true,
    };
    
    if (query.category) {
      where.category = query.category;
    }
    
    if (query.language) {
      where.language = query.language;
    }
    
    if (query.source) {
      where.source = {
        contains: query.source,
        mode: 'insensitive',
      };
    }

    const educationMaterials = await this.prisma.educationMaterial.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { title: 'asc' },
      ],
    });

    this.logger.log(`Found ${educationMaterials.length} education materials`);
    return educationMaterials;
  }

  async getCategories() {
    this.logger.log('Fetching education material categories');
    
    const categories = await this.prisma.educationMaterial.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    const categoryList = categories.map(item => item.category);
    this.logger.log(`Found ${categoryList.length} categories`);
    return categoryList;
  }

  async getLanguages() {
    this.logger.log('Fetching supported languages');
    
    const languages = await this.prisma.educationMaterial.findMany({
      where: { isActive: true },
      select: { language: true },
      distinct: ['language'],
      orderBy: { language: 'asc' },
    });

    const languageList = languages.map(item => item.language);
    this.logger.log(`Found ${languageList.length} languages`);
    return languageList;
  }

  async getFeatured() {
    this.logger.log('Fetching featured education materials');
    
    // Featured materials are those with high priority categories
    const featuredCategories = ['prevention', 'first_aid', 'emergency_contacts'];
    
    const featuredMaterials = await this.prisma.educationMaterial.findMany({
      where: {
        isActive: true,
        category: {
          in: featuredCategories,
        },
      },
      orderBy: [
        { category: 'asc' },
        { lastVerified: 'desc' },
      ],
      take: 10,
    });

    this.logger.log(`Found ${featuredMaterials.length} featured materials`);
    return featuredMaterials;
  }

  async search(query: string, category?: string, language?: string) {
    this.logger.log(`Searching education materials with query: ${query}`);
    
    if (!query || query.trim().length < 2) {
      this.logger.warn('Search query too short');
      throw new BadRequestException('Search query must be at least 2 characters long');
    }

    const where: any = {
      isActive: true,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    };

    if (category) {
      where.category = category;
    }

    if (language) {
      where.language = language;
    }

    const searchResults = await this.prisma.educationMaterial.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { title: 'asc' },
      ],
    });

    this.logger.log(`Found ${searchResults.length} search results`);
    return searchResults;
  }

  async getStatistics() {
    this.logger.log('Generating education material statistics');
    
    const totalMaterials = await this.prisma.educationMaterial.count({
      where: { isActive: true },
    });

    const categoryCounts = await this.prisma.educationMaterial.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      where: { isActive: true },
    });

    const languageCounts = await this.prisma.educationMaterial.groupBy({
      by: ['language'],
      _count: {
        id: true,
      },
      where: { isActive: true },
    });

    const sourceCounts = await this.prisma.educationMaterial.groupBy({
      by: ['source'],
      _count: {
        id: true,
      },
      where: { isActive: true },
    });

    const recentlyUpdated = await this.prisma.educationMaterial.count({
      where: {
        isActive: true,
        lastVerified: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    this.logger.log('Education statistics generated');
    return {
      totalMaterials,
      categoryCounts,
      languageCounts,
      sourceCounts,
      recentlyUpdated,
      lastUpdated: new Date(),
    };
  }

  async findOne(id: string) {
    this.logger.log(`Fetching education material with ID: ${id}`);
    
    const educationMaterial = await this.prisma.educationMaterial.findUnique({
      where: { id },
    });

    if (!educationMaterial) {
      this.logger.warn(`Education material not found with ID: ${id}`);
      throw new NotFoundException(`Education material with ID ${id} not found`);
    }

    if (!educationMaterial.isActive) {
      this.logger.warn(`Education material is inactive: ${id}`);
      throw new NotFoundException(`Education material with ID ${id} is not available`);
    }

    this.logger.log(`Education material found: ${educationMaterial.title}`);
    return educationMaterial;
  }

  async create(createEducationMaterialDto: CreateEducationMaterialDto) {
    this.logger.log('Creating new education material');
    
    // Validate content length
    if (createEducationMaterialDto.content.length < 100) {
      this.logger.warn('Education material content too short');
      throw new BadRequestException('Education material content must be at least 100 characters long');
    }

    // Validate category
    const validCategories = ['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'];
    if (!validCategories.includes(createEducationMaterialDto.category)) {
      this.logger.warn(`Invalid category: ${createEducationMaterialDto.category}`);
      throw new BadRequestException(`Category must be one of: ${validCategories.join(', ')}`);
    }

    const educationMaterial = await this.prisma.educationMaterial.create({
      data: {
        ...createEducationMaterialDto,
        isActive: true,
      },
    });

    this.logger.log(`Education material created with ID: ${educationMaterial.id}`);
    return educationMaterial;
  }

  async update(id: string, updateEducationMaterialDto: UpdateEducationMaterialDto) {
    this.logger.log(`Updating education material with ID: ${id}`);
    
    const existingMaterial = await this.prisma.educationMaterial.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      this.logger.warn(`Education material not found with ID: ${id}`);
      throw new NotFoundException(`Education material with ID ${id} not found`);
    }

    // Validate category if provided
    if (updateEducationMaterialDto.category) {
      const validCategories = ['prevention', 'first_aid', 'treatment', 'awareness', 'emergency_contacts'];
      if (!validCategories.includes(updateEducationMaterialDto.category)) {
        this.logger.warn(`Invalid category: ${updateEducationMaterialDto.category}`);
        throw new BadRequestException(`Category must be one of: ${validCategories.join(', ')}`);
      }
    }

    const educationMaterial = await this.prisma.educationMaterial.update({
      where: { id },
      data: {
        ...updateEducationMaterialDto,
        lastVerified: new Date(), // Update verification date on any change
      },
    });

    this.logger.log(`Education material updated: ${educationMaterial.title}`);
    return educationMaterial;
  }

  async getRelatedMaterials(id: string) {
    this.logger.log(`Finding related materials for ID: ${id}`);
    
    const material = await this.prisma.educationMaterial.findUnique({
      where: { id },
      select: { category: true, language: true },
    });

    if (!material) {
      this.logger.warn(`Education material not found with ID: ${id}`);
      throw new NotFoundException(`Education material with ID ${id} not found`);
    }

    const relatedMaterials = await this.prisma.educationMaterial.findMany({
      where: {
        id: { not: id },
        isActive: true,
        category: material.category,
        language: material.language,
      },
      orderBy: { lastVerified: 'desc' },
      take: 5,
    });

    this.logger.log(`Found ${relatedMaterials.length} related materials`);
    return relatedMaterials;
  }
}

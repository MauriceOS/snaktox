import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { FindContentDto } from './dto/find-content.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createContentDto: CreateContentDto) {
    this.logger.log(`Creating content: ${createContentDto.title}`);
    
    const content = await this.prisma.educationMaterial.create({
      data: {
        title: createContentDto.title,
        content: createContentDto.content,
        category: createContentDto.category,
        language: createContentDto.language || 'en',
        source: createContentDto.source,
        author: createContentDto.author,
        isActive: createContentDto.isActive ?? true,
      },
    });

    this.logger.log(`Content created with ID: ${content.id}`);
    return content;
  }

  async findAll(findContentDto: FindContentDto) {
    this.logger.log('Finding all content with filters');
    
    const where: any = {};
    
    if (findContentDto.category) {
      where.category = findContentDto.category;
    }
    
    if (findContentDto.language) {
      where.language = findContentDto.language;
    }
    
    if (findContentDto.isActive !== undefined) {
      where.isActive = findContentDto.isActive;
    }
    
    if (findContentDto.search) {
      where.OR = [
        { title: { contains: findContentDto.search, mode: 'insensitive' } },
        { content: { contains: findContentDto.search, mode: 'insensitive' } },
      ];
    }

    const content = await this.prisma.educationMaterial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: findContentDto.skip || 0,
      take: findContentDto.take || 20,
    });

    return content;
  }

  async findOne(id: string) {
    this.logger.log(`Finding content with ID: ${id}`);
    
    const content = await this.prisma.educationMaterial.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async update(id: string, updateContentDto: UpdateContentDto) {
    this.logger.log(`Updating content with ID: ${id}`);
    
    const existingContent = await this.findOne(id);
    
    const content = await this.prisma.educationMaterial.update({
      where: { id },
      data: {
        ...updateContentDto,
        lastVerified: new Date(),
      },
    });

    this.logger.log(`Content updated: ${content.id}`);
    return content;
  }

  async remove(id: string) {
    this.logger.log(`Removing content with ID: ${id}`);
    
    await this.findOne(id);
    
    await this.prisma.educationMaterial.delete({
      where: { id },
    });

    this.logger.log(`Content removed: ${id}`);
    return { message: 'Content deleted successfully' };
  }

  async getContentByCategory(category: string, language: string = 'en') {
    this.logger.log(`Getting content for category: ${category}, language: ${language}`);
    
    const content = await this.prisma.educationMaterial.findMany({
      where: {
        category,
        language,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return content;
  }

  async getContentByLanguage(language: string) {
    this.logger.log(`Getting content for language: ${language}`);
    
    const content = await this.prisma.educationMaterial.findMany({
      where: {
        language,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return content;
  }

  async getAvailableLanguages() {
    this.logger.log('Getting available languages');
    
    const languages = await this.prisma.educationMaterial.findMany({
      select: { language: true },
      distinct: ['language'],
      where: { isActive: true },
    });

    return languages.map(lang => lang.language);
  }

  async getContentCategories() {
    this.logger.log('Getting content categories');
    
    const categories = await this.prisma.educationMaterial.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { isActive: true },
    });

    return categories.map(cat => cat.category);
  }

  async verifyContent(id: string, verifiedBy: string) {
    this.logger.log(`Verifying content with ID: ${id} by: ${verifiedBy}`);
    
    const content = await this.prisma.educationMaterial.update({
      where: { id },
      data: {
        lastVerified: new Date(),
        author: verifiedBy,
      },
    });

    this.logger.log(`Content verified: ${content.id}`);
    return content;
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStockUpdateDto } from './dto/create-stock-update.dto';
import { UpdateStockUpdateDto } from './dto/update-stock-update.dto';
import { Logger } from '../../common/logger/logger.service';

@Injectable()
export class StockService {
  private readonly logger = new Logger();

  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    this.logger.log('Fetching all stock updates');
    
    const where = status ? { status: status as any } : {};
    
    const stockUpdates = await this.prisma.stockUpdate.findMany({
      where,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });

    this.logger.log(`Found ${stockUpdates.length} stock updates`);
    return stockUpdates;
  }

  async findByHospital(hospitalId: string, query: any) {
    this.logger.log(`Fetching stock updates for hospital: ${hospitalId}`);
    
    const where: any = { hospitalId };
    
    if (query.status) {
      where.status = query.status;
    }
    
    if (query.antivenomType) {
      where.antivenomType = query.antivenomType;
    }

    const stockUpdates = await this.prisma.stockUpdate.findMany({
      where,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });

    this.logger.log(`Found ${stockUpdates.length} stock updates for hospital`);
    return stockUpdates;
  }

  async findLowStock(threshold: number = 10) {
    this.logger.log(`Finding hospitals with stock below threshold: ${threshold}`);
    
    const lowStockUpdates = await this.prisma.stockUpdate.findMany({
      where: {
        status: 'AVAILABLE',
        quantity: {
          lt: threshold,
        },
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
      },
      orderBy: { quantity: 'asc' },
    });

    this.logger.log(`Found ${lowStockUpdates.length} low stock alerts`);
    return lowStockUpdates;
  }

  async findExpired() {
    this.logger.log('Finding expired antivenom stock');
    
    const expiredStock = await this.prisma.stockUpdate.findMany({
      where: {
        status: 'AVAILABLE',
        expiryDate: {
          lt: new Date(),
        },
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    this.logger.log(`Found ${expiredStock.length} expired stock items`);
    return expiredStock;
  }

  async findOne(id: string) {
    this.logger.log(`Fetching stock update with ID: ${id}`);
    
    const stockUpdate = await this.prisma.stockUpdate.findUnique({
      where: { id },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
            contactInfo: true,
          },
        },
      },
    });

    if (!stockUpdate) {
      this.logger.warn(`Stock update not found with ID: ${id}`);
      throw new NotFoundException(`Stock update with ID ${id} not found`);
    }

    this.logger.log(`Stock update found: ${stockUpdate.antivenomType}`);
    return stockUpdate;
  }

  async create(createStockUpdateDto: CreateStockUpdateDto) {
    this.logger.log('Creating new stock update');
    
    // Validate hospital exists
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: createStockUpdateDto.hospitalId },
    });

    if (!hospital) {
      this.logger.warn(`Hospital not found with ID: ${createStockUpdateDto.hospitalId}`);
      throw new BadRequestException(`Hospital with ID ${createStockUpdateDto.hospitalId} not found`);
    }

    // Validate expiry date is in the future
    if (new Date(createStockUpdateDto.expiryDate) <= new Date()) {
      this.logger.warn('Expiry date must be in the future');
      throw new BadRequestException('Expiry date must be in the future');
    }

    // Determine initial status based on expiry date
    const status = new Date(createStockUpdateDto.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      ? 'EXPIRED' 
      : 'AVAILABLE';

    const stockUpdate = await this.prisma.stockUpdate.create({
      data: {
        ...createStockUpdateDto,
        status,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    this.logger.log(`Stock update created with ID: ${stockUpdate.id}`);
    return stockUpdate;
  }

  async update(id: string, updateStockUpdateDto: UpdateStockUpdateDto) {
    this.logger.log(`Updating stock update with ID: ${id}`);
    
    const existingStockUpdate = await this.prisma.stockUpdate.findUnique({
      where: { id },
    });

    if (!existingStockUpdate) {
      this.logger.warn(`Stock update not found with ID: ${id}`);
      throw new NotFoundException(`Stock update with ID ${id} not found`);
    }

    const stockUpdate = await this.prisma.stockUpdate.update({
      where: { id },
      data: updateStockUpdateDto,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    this.logger.log(`Stock update updated: ${stockUpdate.antivenomType}`);
    return stockUpdate;
  }

  async getStockSummary() {
    this.logger.log('Generating stock summary');
    
    const summary = await this.prisma.stockUpdate.groupBy({
      by: ['status', 'antivenomType'],
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    const totalStock = await this.prisma.stockUpdate.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        status: 'AVAILABLE',
      },
    });

    const lowStockCount = await this.prisma.stockUpdate.count({
      where: {
        status: 'AVAILABLE',
        quantity: {
          lt: 10,
        },
      },
    });

    const expiredCount = await this.prisma.stockUpdate.count({
      where: {
        status: 'EXPIRED',
      },
    });

    this.logger.log('Stock summary generated');
    return {
      summary,
      totalAvailableStock: totalStock._sum.quantity || 0,
      lowStockCount,
      expiredCount,
      lastUpdated: new Date(),
    };
  }
}

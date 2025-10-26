import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { FindCampaignsDto } from './dto/find-campaigns.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCampaignDto: CreateCampaignDto) {
    this.logger.log(`Creating campaign: ${createCampaignDto.title}`);
    
    const campaign = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'campaign_created',
        metadata: {
          title: createCampaignDto.title,
          description: createCampaignDto.description,
          type: createCampaignDto.type,
          targetAudience: createCampaignDto.targetAudience,
          region: createCampaignDto.region,
          language: createCampaignDto.language,
          startDate: createCampaignDto.startDate,
          endDate: createCampaignDto.endDate,
          status: 'active',
          createdBy: createCampaignDto.createdBy,
          content: createCampaignDto.content,
          mediaUrls: createCampaignDto.mediaUrls || [],
          tags: createCampaignDto.tags || [],
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Campaign created with ID: ${campaign.id}`);
    return {
      id: campaign.id,
      ...(campaign.metadata as any || {}),
    };
  }

  async findAll(findCampaignsDto: FindCampaignsDto) {
    this.logger.log('Finding all campaigns with filters');
    
    const where: any = {
      eventType: 'campaign_created',
    };
    
    if (findCampaignsDto.type) {
      where.metadata = {
        path: ['type'],
        equals: findCampaignsDto.type,
      };
    }
    
    if (findCampaignsDto.region) {
      where.metadata = {
        path: ['region'],
        equals: findCampaignsDto.region,
      };
    }
    
    if (findCampaignsDto.language) {
      where.metadata = {
        path: ['language'],
        equals: findCampaignsDto.language,
      };
    }
    
    if (findCampaignsDto.status) {
      where.metadata = {
        path: ['status'],
        equals: findCampaignsDto.status,
      };
    }

    const campaigns = await this.prisma.analyticsLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: findCampaignsDto.skip || 0,
      take: findCampaignsDto.take || 20,
    });

    return campaigns.map(campaign => ({
      id: campaign.id,
      ...(campaign.metadata as any || {}),
      createdAt: campaign.timestamp,
    }));
  }

  async findOne(id: string) {
    this.logger.log(`Finding campaign with ID: ${id}`);
    
    const campaign = await this.prisma.analyticsLog.findFirst({
      where: {
        id,
        eventType: 'campaign_created',
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return {
      id: campaign.id,
      ...(campaign.metadata as any || {}),
      createdAt: campaign.timestamp,
    };
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    this.logger.log(`Updating campaign with ID: ${id}`);
    
    const existingCampaign = await this.findOne(id);
    
    const updatedMetadata = {
      ...existingCampaign,
      ...updateCampaignDto,
      updatedAt: new Date().toISOString(),
    };

    const campaign = await this.prisma.analyticsLog.update({
      where: { id },
      data: {
        metadata: updatedMetadata,
      },
    });

    this.logger.log(`Campaign updated: ${campaign.id}`);
    return {
      id: campaign.id,
      ...(campaign.metadata as any || {}),
      createdAt: campaign.timestamp,
    };
  }

  async remove(id: string) {
    this.logger.log(`Removing campaign with ID: ${id}`);
    
    await this.findOne(id);
    
    await this.prisma.analyticsLog.delete({
      where: { id },
    });

    this.logger.log(`Campaign removed: ${id}`);
    return { message: 'Campaign deleted successfully' };
  }

  async getActiveCampaigns(region?: string, language?: string) {
    this.logger.log(`Getting active campaigns for region: ${region}, language: ${language}`);
    
    const where: any = {
      eventType: 'campaign_created',
      metadata: {
        path: ['status'],
        equals: 'active',
      },
    };

    if (region) {
      where.metadata = {
        path: ['region'],
        equals: region,
      };
    }

    if (language) {
      where.metadata = {
        path: ['language'],
        equals: language,
      };
    }

    const campaigns = await this.prisma.analyticsLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    return campaigns.map(campaign => ({
      id: campaign.id,
      ...(campaign.metadata as any || {}),
      createdAt: campaign.timestamp,
    }));
  }

  async getCampaignStatistics() {
    this.logger.log('Getting campaign statistics');
    
    const totalCampaigns = await this.prisma.analyticsLog.count({
      where: { eventType: 'campaign_created' },
    });

    const activeCampaigns = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'campaign_created',
        metadata: {
          path: ['status'],
          equals: 'active',
        },
      },
    });

    const campaignsByType = await this.prisma.analyticsLog.groupBy({
      by: ['metadata'],
      where: { eventType: 'campaign_created' },
      _count: true,
    });

    const campaignsByRegion = await this.prisma.analyticsLog.groupBy({
      by: ['metadata'],
      where: { eventType: 'campaign_created' },
      _count: true,
    });

    return {
      totalCampaigns,
      activeCampaigns,
      campaignsByType: campaignsByType.map(item => ({
        type: item.metadata['type'],
        count: item._count,
      })),
      campaignsByRegion: campaignsByRegion.map(item => ({
        region: item.metadata['region'],
        count: item._count,
      })),
    };
  }

  async trackCampaignEngagement(campaignId: string, engagementType: string, userId?: string) {
    this.logger.log(`Tracking campaign engagement: ${engagementType} for campaign: ${campaignId}`);
    
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'campaign_engagement',
        userId,
        metadata: {
          campaignId,
          engagementType,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }
}

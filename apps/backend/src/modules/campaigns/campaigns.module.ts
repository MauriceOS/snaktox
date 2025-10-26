import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CommunityService } from './community.service';
import { AwarenessService } from './awareness.service';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, CommunityService, AwarenessService],
  exports: [CampaignsService, CommunityService, AwarenessService],
})
export class CampaignsModule {}

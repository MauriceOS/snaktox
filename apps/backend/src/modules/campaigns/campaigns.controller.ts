import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CommunityService } from './community.service';
import { AwarenessService } from './awareness.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { FindCampaignsDto } from './dto/find-campaigns.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { CreateCommunityEventDto } from './dto/create-community-event.dto';
import { CreateAwarenessProgramDto } from './dto/create-awareness-program.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly communityService: CommunityService,
    private readonly awarenessService: AwarenessService,
  ) {}

  // Campaign endpoints
  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  findAll(@Query() findCampaignsDto: FindCampaignsDto) {
    return this.campaignsService.findAll(findCampaignsDto);
  }

  @Get('active')
  getActiveCampaigns(
    @Query('region') region?: string,
    @Query('language') language?: string,
  ) {
    return this.campaignsService.getActiveCampaigns(region, language);
  }

  @Get('statistics')
  getCampaignStatistics() {
    return this.campaignsService.getCampaignStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }

  @Post(':id/engage')
  trackEngagement(
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('userId') userId?: string,
  ) {
    return this.campaignsService.trackCampaignEngagement(id, type, userId);
  }

  // Community endpoints
  @Post('community/posts')
  createPost(@Body() createPostDto: CreateCommunityPostDto) {
    return this.communityService.createPost(createPostDto);
  }

  @Get('community/posts')
  getPosts(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ) {
    return this.communityService.getPosts(category, type, limit);
  }

  @Post('community/events')
  createEvent(@Body() createEventDto: CreateCommunityEventDto) {
    return this.communityService.createEvent(createEventDto);
  }

  @Get('community/events')
  getEvents(
    @Query('upcoming') upcoming?: boolean,
    @Query('limit') limit?: number,
  ) {
    return this.communityService.getEvents(upcoming, limit);
  }

  @Post('community/events/:id/join')
  joinEvent(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.communityService.joinEvent(id, userId);
  }

  @Get('community/events/:id/attendees')
  getEventAttendees(@Param('id') id: string) {
    return this.communityService.getEventAttendees(id);
  }

  @Post('community/posts/:id/comments')
  createComment(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('content') content: string,
  ) {
    return this.communityService.createComment(id, userId, content);
  }

  @Get('community/posts/:id/comments')
  getComments(@Param('id') id: string) {
    return this.communityService.getComments(id);
  }

  @Get('community/statistics')
  getCommunityStatistics() {
    return this.communityService.getCommunityStatistics();
  }

  // Awareness endpoints
  @Post('awareness/programs')
  createAwarenessProgram(@Body() createProgramDto: CreateAwarenessProgramDto) {
    return this.awarenessService.createAwarenessProgram(createProgramDto);
  }

  @Get('awareness/programs')
  getAwarenessPrograms(
    @Query('region') region?: string,
    @Query('type') type?: string,
  ) {
    return this.awarenessService.getAwarenessPrograms(region, type);
  }

  @Get('awareness/programs/active')
  getActivePrograms() {
    return this.awarenessService.getActivePrograms();
  }

  @Post('awareness/programs/:id/participate')
  trackParticipation(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('activity') activity: string,
  ) {
    return this.awarenessService.trackProgramParticipation(id, userId, activity);
  }

  @Get('awareness/programs/:id/statistics')
  getProgramStatistics(@Param('id') id: string) {
    return this.awarenessService.getProgramStatistics(id);
  }

  @Post('awareness/content')
  createEducationalContent(@Body() contentData: any) {
    return this.awarenessService.createEducationalContent(contentData);
  }

  @Get('awareness/resources')
  getEducationalResources(
    @Query('category') category?: string,
    @Query('language') language?: string,
  ) {
    return this.awarenessService.getEducationalResources(category, language);
  }

  @Post('awareness/training')
  createTrainingSession(@Body() sessionData: any) {
    return this.awarenessService.createTrainingSession(sessionData);
  }

  @Get('awareness/training')
  getTrainingSessions(@Query('upcoming') upcoming?: boolean) {
    return this.awarenessService.getTrainingSessions(upcoming);
  }

  @Post('awareness/training/:id/register')
  registerForTraining(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.awarenessService.registerForTraining(id, userId);
  }

  @Get('awareness/statistics')
  getAwarenessStatistics() {
    return this.awarenessService.getAwarenessStatistics();
  }
}

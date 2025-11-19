import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { CreateCommunityEventDto } from './dto/create-community-event.dto';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: CreateCommunityPostDto) {
    this.logger.log(`Creating community post: ${createPostDto.title}`);
    
    const post = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'community_post',
        userId: createPostDto.authorId,
        metadata: {
          title: createPostDto.title,
          content: createPostDto.content,
          type: createPostDto.type,
          category: createPostDto.category,
          tags: createPostDto.tags || [],
          mediaUrls: createPostDto.mediaUrls || [],
          location: createPostDto.location,
          isPublic: createPostDto.isPublic ?? true,
          allowComments: createPostDto.allowComments ?? true,
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Community post created with ID: ${post.id}`);
    return {
      id: post.id,
      ...(post.metadata as any || {}),
      createdAt: post.timestamp,
    };
  }

  async getPosts(category?: string, type?: string, limit: number = 20) {
    this.logger.log(`Getting community posts - category: ${category}, type: ${type}`);
    
    const where: any = {
      eventType: 'community_post',
      metadata: {
        path: ['isPublic'],
        equals: true,
      },
    };

    if (category) {
      where.metadata = {
        path: ['category'],
        equals: category,
      };
    }

    if (type) {
      where.metadata = {
        path: ['type'],
        equals: type,
      };
    }

    const posts = await this.prisma.analyticsLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return posts.map(post => ({
      id: post.id,
      ...(post.metadata as any || {}),
      createdAt: post.timestamp,
      authorId: post.userId,
    }));
  }

  async createEvent(createEventDto: CreateCommunityEventDto) {
    this.logger.log(`Creating community event: ${createEventDto.title}`);
    
    const event = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'community_event',
        userId: createEventDto.organizerId,
        metadata: {
          title: createEventDto.title,
          description: createEventDto.description,
          type: createEventDto.type,
          location: createEventDto.location,
          startDate: createEventDto.startDate,
          endDate: createEventDto.endDate,
          maxAttendees: createEventDto.maxAttendees,
          isPublic: createEventDto.isPublic ?? true,
          registrationRequired: createEventDto.registrationRequired ?? false,
          tags: createEventDto.tags || [],
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Community event created with ID: ${event.id}`);
    return {
      id: event.id,
      ...(event.metadata as any || {}),
      createdAt: event.timestamp,
      organizerId: event.userId,
    };
  }

  async getEvents(upcoming: boolean = true, limit: number = 20) {
    this.logger.log(`Getting community events - upcoming: ${upcoming}`);
    
    const where: any = {
      eventType: 'community_event',
      metadata: {
        path: ['isPublic'],
        equals: true,
      },
    };

    const events = await this.prisma.analyticsLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    let filteredEvents = events.map(event => ({
      id: event.id,
      ...(event.metadata as any || {}),
      createdAt: event.timestamp,
      organizerId: event.userId,
    }));

    if (upcoming) {
      const now = new Date();
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.startDate) > now
      );
    }

    return filteredEvents;
  }

  async joinEvent(eventId: string, userId: string) {
    this.logger.log(`User ${userId} joining event ${eventId}`);
    
    // Check if event exists
    const event = await this.prisma.analyticsLog.findFirst({
      where: {
        id: eventId,
        eventType: 'community_event',
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user already joined
    const existingJoin = await this.prisma.analyticsLog.findFirst({
      where: {
        eventType: 'event_join',
        userId,
        metadata: {
          path: ['eventId'],
          equals: eventId,
        } as any, // MongoDB compatibility fix
      },
    });

    if (existingJoin) {
      throw new Error('User already joined this event');
    }

    // Create join record
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'event_join',
        userId,
        metadata: {
          eventId,
          joinedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`User ${userId} successfully joined event ${eventId}`);
    return { message: 'Successfully joined event' };
  }

  async getEventAttendees(eventId: string) {
    this.logger.log(`Getting attendees for event: ${eventId}`);
    
    const attendees = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'event_join',
        metadata: {
          path: ['eventId'],
          equals: eventId,
        } as any, // MongoDB compatibility fix
      },
      orderBy: { timestamp: 'asc' },
    });

    return attendees.map(attendee => ({
      userId: attendee.userId,
      joinedAt: attendee.metadata['joinedAt'],
    }));
  }

  async createComment(postId: string, userId: string, content: string) {
    this.logger.log(`Creating comment on post: ${postId}`);
    
    const comment = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'community_comment',
        userId,
        metadata: {
          postId,
          content,
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Comment created with ID: ${comment.id}`);
    return {
      id: comment.id,
      ...(comment.metadata as any || {}),
      createdAt: comment.timestamp,
      authorId: comment.userId,
    };
  }

  async getComments(postId: string) {
    this.logger.log(`Getting comments for post: ${postId}`);
    
    const comments = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'community_comment',
        metadata: {
          path: ['postId'],
          equals: postId,
        } as any, // MongoDB compatibility fix
      },
      orderBy: { timestamp: 'asc' },
    });

    return comments.map(comment => ({
      id: comment.id,
      ...(comment.metadata as any || {}),
      createdAt: comment.timestamp,
      authorId: comment.userId,
    }));
  }

  async getCommunityStatistics() {
    this.logger.log('Getting community statistics');
    
    const totalPosts = await this.prisma.analyticsLog.count({
      where: { eventType: 'community_post' },
    });

    const totalEvents = await this.prisma.analyticsLog.count({
      where: { eventType: 'community_event' },
    });

    const totalComments = await this.prisma.analyticsLog.count({
      where: { eventType: 'community_comment' },
    });

    const activeUsers = await this.prisma.analyticsLog.groupBy({
      by: ['userId'],
      where: {
        eventType: { in: ['community_post', 'community_event', 'community_comment'] },
      },
      _count: true,
    });

    return {
      totalPosts,
      totalEvents,
      totalComments,
      activeUsers: activeUsers.length,
      postsByCategory: [], // Would need to aggregate from metadata
      eventsByType: [], // Would need to aggregate from metadata
    };
  }
}

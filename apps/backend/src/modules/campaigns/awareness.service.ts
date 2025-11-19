import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAwarenessProgramDto } from './dto/create-awareness-program.dto';

@Injectable()
export class AwarenessService {
  private readonly logger = new Logger(AwarenessService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createAwarenessProgram(createProgramDto: CreateAwarenessProgramDto) {
    this.logger.log(`Creating awareness program: ${createProgramDto.title}`);
    
    const program = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'awareness_program',
        metadata: {
          title: createProgramDto.title,
          description: createProgramDto.description,
          type: createProgramDto.type,
          targetAudience: createProgramDto.targetAudience,
          region: createProgramDto.region,
          language: createProgramDto.language,
          startDate: createProgramDto.startDate,
          endDate: createProgramDto.endDate,
          objectives: createProgramDto.objectives,
          activities: createProgramDto.activities,
          resources: createProgramDto.resources,
          partners: createProgramDto.partners || [],
          budget: createProgramDto.budget,
          status: 'active',
          createdBy: createProgramDto.createdBy,
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Awareness program created with ID: ${program.id}`);
    return {
      id: program.id,
      ...(program.metadata as any || {}),
      createdAt: program.timestamp,
    };
  }

  async getAwarenessPrograms(region?: string, type?: string) {
    this.logger.log(`Getting awareness programs - region: ${region}, type: ${type}`);
    
    const where: any = {
      eventType: 'awareness_program',
    };

    if (region) {
      where.metadata = {
        path: ['region'],
        equals: region,
      };
    }

    if (type) {
      where.metadata = {
        path: ['type'],
        equals: type,
      };
    }

    const programs = await this.prisma.analyticsLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    return programs.map(program => ({
      id: program.id,
      ...(program.metadata as any || {}),
      createdAt: program.timestamp,
    }));
  }

  async getActivePrograms() {
    this.logger.log('Getting active awareness programs');
    
    const programs = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'awareness_program',
        metadata: {
          path: ['status'],
          equals: 'active',
        } as any, // MongoDB compatibility fix
      },
      orderBy: { timestamp: 'desc' },
    });

    return programs.map(program => ({
      id: program.id,
      ...(program.metadata as any || {}),
      createdAt: program.timestamp,
    }));
  }

  async trackProgramParticipation(programId: string, userId: string, activity: string) {
    this.logger.log(`Tracking program participation: ${activity} for program: ${programId}`);
    
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'program_participation',
        userId,
        metadata: {
          programId,
          activity,
          participatedAt: new Date().toISOString(),
        },
      },
    });
  }

  async getProgramStatistics(programId: string) {
    this.logger.log(`Getting statistics for program: ${programId}`);
    
    const participations = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'program_participation',
        metadata: {
          path: ['programId'],
          equals: programId,
        } as any, // MongoDB compatibility fix
      },
    });

    const uniqueParticipants = new Set(participations.map(p => p.userId)).size;
    const totalActivities = participations.length;

    const activitiesByType = participations.reduce((acc, participation) => {
      const activity = participation.metadata['activity'];
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {});

    return {
      uniqueParticipants,
      totalActivities,
      activitiesByType,
    };
  }

  async createEducationalContent(contentData: any) {
    this.logger.log(`Creating educational content: ${contentData.title}`);
    
    const content = await this.prisma.educationMaterial.create({
      data: {
        title: contentData.title,
        content: contentData.content,
        category: 'awareness',
        language: contentData.language || 'en',
        source: contentData.source || 'SnaKTox Awareness Program',
        author: contentData.author,
        isActive: true,
      },
    });

    this.logger.log(`Educational content created with ID: ${content.id}`);
    return content;
  }

  async getEducationalResources(category?: string, language?: string) {
    this.logger.log(`Getting educational resources - category: ${category}, language: ${language}`);
    
    const where: any = {
      category: category || 'awareness',
      isActive: true,
    };

    if (language) {
      where.language = language;
    }

    const resources = await this.prisma.educationMaterial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return resources;
  }

  async createTrainingSession(sessionData: any) {
    this.logger.log(`Creating training session: ${sessionData.title}`);
    
    const session = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'training_session',
        metadata: {
          title: sessionData.title,
          description: sessionData.description,
          type: sessionData.type,
          instructor: sessionData.instructor,
          location: sessionData.location,
          startDate: sessionData.startDate,
          endDate: sessionData.endDate,
          maxParticipants: sessionData.maxParticipants,
          materials: sessionData.materials || [],
          objectives: sessionData.objectives || [],
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Training session created with ID: ${session.id}`);
    return {
      id: session.id,
      ...(session.metadata as any || {}),
      createdAt: session.timestamp,
    };
  }

  async getTrainingSessions(upcoming: boolean = true) {
    this.logger.log(`Getting training sessions - upcoming: ${upcoming}`);
    
    const sessions = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'training_session',
      },
      orderBy: { timestamp: 'desc' },
    });

    let filteredSessions = sessions.map(session => ({
      id: session.id,
      ...(session.metadata as any || {}),
      createdAt: session.timestamp,
    }));

    if (upcoming) {
      const now = new Date();
      filteredSessions = filteredSessions.filter(session => 
        new Date(session.startDate) > now
      );
    }

    return filteredSessions;
  }

  async registerForTraining(sessionId: string, userId: string) {
    this.logger.log(`User ${userId} registering for training session ${sessionId}`);
    
    // Check if session exists
    const session = await this.prisma.analyticsLog.findFirst({
      where: {
        id: sessionId,
        eventType: 'training_session',
      },
    });

    if (!session) {
      throw new Error('Training session not found');
    }

    // Check if user already registered
    const existingRegistration = await this.prisma.analyticsLog.findFirst({
      where: {
        eventType: 'training_registration',
        userId,
        metadata: {
          path: ['sessionId'],
          equals: sessionId,
        } as any, // MongoDB compatibility fix
      },
    });

    if (existingRegistration) {
      throw new Error('User already registered for this training session');
    }

    // Create registration record
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'training_registration',
        userId,
        metadata: {
          sessionId,
          registeredAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`User ${userId} successfully registered for training session ${sessionId}`);
    return { message: 'Successfully registered for training session' };
  }

  async getAwarenessStatistics() {
    this.logger.log('Getting awareness statistics');
    
    const totalPrograms = await this.prisma.analyticsLog.count({
      where: { eventType: 'awareness_program' },
    });

    const activePrograms = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'awareness_program',
        metadata: {
          path: ['status'],
          equals: 'active',
        } as any, // MongoDB compatibility fix
      },
    });

    const totalTrainingSessions = await this.prisma.analyticsLog.count({
      where: { eventType: 'training_session' },
    });

    const totalParticipants = await this.prisma.analyticsLog.count({
      where: { eventType: 'program_participation' },
    });

    return {
      totalPrograms,
      activePrograms,
      totalTrainingSessions,
      totalParticipants,
    };
  }
}

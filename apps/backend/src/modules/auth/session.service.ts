import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, sessionData: CreateSessionDto) {
    this.logger.log(`Creating session for user: ${userId}`);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'user_session',
        userId,
        sessionId: this.generateSessionId(),
        metadata: {
          userAgent: sessionData.userAgent,
          ipAddress: sessionData.ipAddress,
          deviceType: sessionData.deviceType,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          isActive: true,
        },
      },
    });

    this.logger.log(`Session created with ID: ${session.id}`);
    return {
      id: session.id,
      sessionId: session.sessionId,
      expiresAt,
      createdAt: session.timestamp,
    };
  }

  async validateSession(sessionId: string): Promise<boolean> {
    this.logger.log(`Validating session: ${sessionId}`);
    
    const session = await this.prisma.analyticsLog.findFirst({
      where: {
        sessionId,
        eventType: 'user_session',
        metadata: {
          path: ['isActive'],
          equals: true,
        },
      },
    });

    if (!session) {
      this.logger.log(`Session not found or inactive: ${sessionId}`);
      return false;
    }

    const expiresAt = new Date(session.metadata['expiresAt']);
    const isExpired = expiresAt < new Date();

    if (isExpired) {
      this.logger.log(`Session expired: ${sessionId}`);
      await this.revokeSession(sessionId);
      return false;
    }

    this.logger.log(`Session valid: ${sessionId}`);
    return true;
  }

  async getSession(sessionId: string) {
    this.logger.log(`Getting session: ${sessionId}`);
    
    const session = await this.prisma.analyticsLog.findFirst({
      where: {
        sessionId,
        eventType: 'user_session',
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      sessionId: session.sessionId,
      userId: session.userId,
      metadata: session.metadata,
      createdAt: session.timestamp,
    };
  }

  async revokeSession(sessionId: string) {
    this.logger.log(`Revoking session: ${sessionId}`);
    
    const session = await this.prisma.analyticsLog.findFirst({
      where: {
        sessionId,
        eventType: 'user_session',
      },
    });

    if (session) {
      await this.prisma.analyticsLog.update({
        where: { id: session.id },
        data: {
          metadata: {
            ...(session.metadata as any || {}),
            isActive: false,
            revokedAt: new Date().toISOString(),
          },
        },
      });

      this.logger.log(`Session revoked: ${sessionId}`);
    }
  }

  async revokeAllUserSessions(userId: string) {
    this.logger.log(`Revoking all sessions for user: ${userId}`);
    
    const sessions = await this.prisma.analyticsLog.findMany({
      where: {
        userId,
        eventType: 'user_session',
        metadata: {
          path: ['isActive'],
          equals: true,
        },
      },
    });

    for (const session of sessions) {
      await this.prisma.analyticsLog.update({
        where: { id: session.id },
        data: {
          metadata: {
            ...(session.metadata as any || {}),
            isActive: false,
            revokedAt: new Date().toISOString(),
          },
        },
      });
    }

    this.logger.log(`Revoked ${sessions.length} sessions for user: ${userId}`);
  }

  async getUserSessions(userId: string) {
    this.logger.log(`Getting sessions for user: ${userId}`);
    
    const sessions = await this.prisma.analyticsLog.findMany({
      where: {
        userId,
        eventType: 'user_session',
      },
      orderBy: { timestamp: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      sessionId: session.sessionId,
      metadata: session.metadata,
      createdAt: session.timestamp,
    }));
  }

  async getActiveSessions(userId: string) {
    this.logger.log(`Getting active sessions for user: ${userId}`);
    
    const sessions = await this.prisma.analyticsLog.findMany({
      where: {
        userId,
        eventType: 'user_session',
        metadata: {
          path: ['isActive'],
          equals: true,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      sessionId: session.sessionId,
      metadata: session.metadata,
      createdAt: session.timestamp,
    }));
  }

  async cleanupExpiredSessions() {
    this.logger.log('Cleaning up expired sessions');
    
    const now = new Date();
    const expiredSessions = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'user_session',
        metadata: {
          path: ['isActive'],
          equals: true,
        },
      },
    });

    let cleanedCount = 0;
    for (const session of expiredSessions) {
      const expiresAt = new Date(session.metadata['expiresAt']);
      if (expiresAt < now) {
        await this.prisma.analyticsLog.update({
          where: { id: session.id },
          data: {
            metadata: {
              ...(session.metadata as any || {}),
              isActive: false,
              expiredAt: new Date().toISOString(),
            },
          },
        });
        cleanedCount++;
      }
    }

    this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
    return cleanedCount;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

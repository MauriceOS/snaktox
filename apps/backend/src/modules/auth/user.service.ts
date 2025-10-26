import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Creating user: ${createUserDto.email}`);
    
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        role: (createUserDto.role as any) || 'USER',
        isActive: createUserDto.isActive ?? true,
        isVerified: createUserDto.isVerified ?? false,
        profile: createUserDto.profile,
      },
    });

    this.logger.log(`User created with ID: ${user.id}`);
    return this.sanitizeUser(user);
  }

  async findAll(skip: number = 0, take: number = 20, role?: string) {
    this.logger.log('Finding all users');
    
    const where: any = {};
    if (role) {
      where.role = role;
    }

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.sanitizeUser(user));
  }

  async findById(id: string) {
    this.logger.log(`Finding user by ID: ${id}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    this.logger.log(`Finding user by email: ${email}`);
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`);
    
    const existingUser = await this.findById(id);
    
    // Handle role type casting
    const updateData: any = {
      ...updateUserDto,
      updatedAt: new Date(),
    };
    
    if (updateUserDto.role) {
      updateData.role = updateUserDto.role as any;
    }
    
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`User updated: ${user.id}`);
    return this.sanitizeUser(user);
  }

  async remove(id: string) {
    this.logger.log(`Removing user with ID: ${id}`);
    
    await this.findById(id);
    
    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`User removed: ${id}`);
    return { message: 'User deleted successfully' };
  }

  async deactivate(id: string) {
    this.logger.log(`Deactivating user with ID: ${id}`);
    
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`User deactivated: ${user.id}`);
    return this.sanitizeUser(user);
  }

  async activate(id: string) {
    this.logger.log(`Activating user with ID: ${id}`);
    
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`User activated: ${user.id}`);
    return this.sanitizeUser(user);
  }

  async updateProfile(id: string, profileData: any) {
    this.logger.log(`Updating profile for user: ${id}`);
    
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          ...profileData,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Profile updated for user: ${user.id}`);
    return this.sanitizeUser(user);
  }

  async getUserStatistics() {
    this.logger.log('Getting user statistics');
    
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });
    const verifiedUsers = await this.prisma.user.count({
      where: { isVerified: true },
    });

    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const recentUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      recentUsers,
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count,
      })),
    };
  }

  async searchUsers(query: string, limit: number = 10) {
    this.logger.log(`Searching users with query: ${query}`);
    
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.sanitizeUser(user));
  }

  async getUserActivity(userId: string, limit: number = 50) {
    this.logger.log(`Getting activity for user: ${userId}`);
    
    const activities = await this.prisma.analyticsLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return activities.map(activity => ({
      id: activity.id,
      eventType: activity.eventType,
      metadata: activity.metadata,
      timestamp: activity.timestamp,
    }));
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserService } from './user.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registering new user: ${registerDto.email}`);
    
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: (registerDto.role as any) || 'USER',
        isActive: true,
        isVerified: false,
        profile: {
          dateOfBirth: registerDto.dateOfBirth,
          gender: registerDto.gender,
          location: registerDto.location,
          emergencyContact: registerDto.emergencyContact,
          medicalConditions: registerDto.medicalConditions || [],
          allergies: registerDto.allergies || [],
        },
      },
    });

    // Generate email verification token
    const verificationToken = await this.generateVerificationToken(user.id);

    // Log registration
    await this.logAuthEvent('user_registered', user.id, {
      email: user.email,
      role: user.role,
      registrationMethod: 'email',
    });

    this.logger.log(`User registered successfully: ${user.id}`);
    
    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please check your email for verification.',
      verificationToken,
    };
  }

  async login(loginDto: LoginDto, clientInfo?: any) {
    this.logger.log(`Login attempt for: ${loginDto.email}`);
    
    // Find user
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      await this.logAuthEvent('login_failed', user.id, {
        reason: 'invalid_password',
        email: loginDto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    const session = await this.sessionService.createSession(user.id, {
      userAgent: clientInfo?.userAgent,
      ipAddress: clientInfo?.ipAddress,
      deviceType: clientInfo?.deviceType,
    });

    // Log successful login
    await this.logAuthEvent('login_success', user.id, {
      email: user.email,
      sessionId: session.id,
      loginMethod: 'email',
    });

    this.logger.log(`User logged in successfully: ${user.id}`);
    
    return {
      user: this.sanitizeUser(user),
      tokens,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  async logout(userId: string, sessionId?: string) {
    this.logger.log(`Logout for user: ${userId}`);
    
    if (sessionId) {
      await this.sessionService.revokeSession(sessionId);
    } else {
      await this.sessionService.revokeAllUserSessions(userId);
    }

    // Log logout
    await this.logAuthEvent('logout', userId, {
      sessionId,
    });

    this.logger.log(`User logged out successfully: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    this.logger.log('Refreshing token');
    
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      
      this.logger.log(`Token refreshed for user: ${user.id}`);
      return { tokens };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    this.logger.log(`Password reset requested for: ${forgotPasswordDto.email}`);
    
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = await this.generateResetToken(user.id);
    
    // Log password reset request
    await this.logAuthEvent('password_reset_requested', user.id, {
      email: user.email,
    });

    this.logger.log(`Password reset token generated for user: ${user.id}`);
    return {
      message: 'If the email exists, a reset link has been sent',
      resetToken, // In production, this would be sent via email
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    this.logger.log('Resetting password');
    
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await this.passwordService.hashPassword(resetPasswordDto.password);

      // Update password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Revoke all sessions
      await this.sessionService.revokeAllUserSessions(user.id);

      // Log password reset
      await this.logAuthEvent('password_reset', user.id, {
        email: user.email,
      });

      this.logger.log(`Password reset successfully for user: ${user.id}`);
      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid reset token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    this.logger.log(`Changing password for user: ${userId}`);
    
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.passwordService.hashPassword(changePasswordDto.newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Log password change
    await this.logAuthEvent('password_changed', userId, {
      email: user.email,
    });

    this.logger.log(`Password changed successfully for user: ${userId}`);
    return { message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    this.logger.log('Verifying email');
    
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Invalid verification token');
      }

      if (user.isVerified) {
        return { message: 'Email already verified' };
      }

      // Update user
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      // Log email verification
      await this.logAuthEvent('email_verified', user.id, {
        email: user.email,
      });

      this.logger.log(`Email verified successfully for user: ${user.id}`);
      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid verification token');
    }
  }

  async resendVerificationEmail(email: string) {
    this.logger.log(`Resending verification email for: ${email}`);
    
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = await this.generateVerificationToken(user.id);
    
    this.logger.log(`Verification email resent for user: ${user.id}`);
    return {
      message: 'Verification email sent',
      verificationToken, // In production, this would be sent via email
    };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateVerificationToken(userId: string) {
    const payload = {
      sub: userId,
      type: 'email_verification',
    };

    return this.jwtService.signAsync(payload, { expiresIn: '24h' });
  }

  private async generateResetToken(userId: string) {
    const payload = {
      sub: userId,
      type: 'password_reset',
    };

    return this.jwtService.signAsync(payload, { expiresIn: '1h' });
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private async logAuthEvent(eventType: string, userId: string, metadata: any) {
    await this.prisma.analyticsLog.create({
      data: {
        eventType,
        userId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getUserSessions(userId: string) {
    return this.sessionService.getUserSessions(userId);
  }

  async revokeSession(userId: string, sessionId: string) {
    return this.sessionService.revokeSession(sessionId);
  }
}

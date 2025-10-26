import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    this.logger.log('Hashing password');
    
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      this.logger.log('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      this.logger.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    this.logger.log('Verifying password');
    
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      
      this.logger.log(`Password verification result: ${isMatch}`);
      return isMatch;
    } catch (error) {
      this.logger.error('Error verifying password:', error);
      return false;
    }
  }

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    this.logger.log('Validating password strength');
    
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    const isValid = errors.length === 0;
    
    this.logger.log(`Password strength validation result: ${isValid}`);
    return { isValid, errors };
  }

  generateRandomPassword(length: number = 12): string {
    this.logger.log(`Generating random password of length: ${length}`);
    
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    this.logger.log('Random password generated');
    return password;
  }

  async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    this.logger.log(`Checking password history for user: ${userId}`);
    
    // In a real implementation, you would check against stored password history
    // For now, we'll return true (password not in history)
    return true;
  }
}

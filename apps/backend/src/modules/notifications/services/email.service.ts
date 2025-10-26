import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { first } from 'rxjs/operators';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly smtpHost: string;
  private readonly smtpPort: number;
  private readonly smtpUser: string;
  private readonly smtpPass: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.smtpHost = this.configService.get('SMTP_HOST');
    this.smtpPort = parseInt(this.configService.get('SMTP_PORT', '587'));
    this.smtpUser = this.configService.get('SMTP_USER');
    this.smtpPass = this.configService.get('SMTP_PASS');
  }

  async sendEmail(to: string, message: string, type: string): Promise<void> {
    this.logger.log(`Sending email to ${to} (type: ${type})`);
    
    try {
      const subject = this.getEmailSubject(type);
      const htmlContent = this.formatEmailContent(message, type);
      
      // For now, we'll use a simple HTTP-based email service
      // In production, you might want to use a service like SendGrid, Mailgun, or AWS SES
      const response = await this.httpService.post(
          'https://api.emailjs.com/api/v1.0/email/send',
          {
            service_id: 'your_service_id',
            template_id: 'your_template_id',
            user_id: 'your_user_id',
            template_params: {
              to_email: to,
              subject: subject,
              message: htmlContent,
              from_name: 'SnaKTox Emergency System',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`Email sent successfully to ${to}`);
      
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  async sendBulkEmail(recipients: string[], message: string, type: string): Promise<void> {
    this.logger.log(`Sending bulk email to ${recipients.length} recipients (type: ${type})`);
    
    try {
      const subject = this.getEmailSubject(type);
      const htmlContent = this.formatEmailContent(message, type);
      
      const results = await Promise.allSettled(
        recipients.map(recipient => this.sendEmail(recipient, message, type))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      this.logger.log(`Bulk email completed: ${successful} successful, ${failed} failed`);
      
    } catch (error) {
      this.logger.error(`Failed to send bulk email: ${error.message}`);
      throw new Error(`Bulk email delivery failed: ${error.message}`);
    }
  }

  private getEmailSubject(type: string): string {
    switch (type) {
      case 'sos_alert':
        return '🚨 URGENT: Snakebite Emergency Alert';
      case 'hospital_update':
        return '🏥 Hospital System Update';
      case 'stock_alert':
        return '⚠️ Antivenom Stock Alert';
      case 'emergency':
        return '🚨 CRITICAL: Emergency Alert';
      default:
        return 'SnaKTox System Notification';
    }
  }

  private formatEmailContent(message: string, type: string): string {
    const headerColor = this.getHeaderColor(type);
    const icon = this.getTypeIcon(type);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SnaKTox Emergency System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: ${headerColor};
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 8px 8px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .urgent {
            background-color: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .warning {
            background-color: #ffaa00;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .info {
            background-color: #4444ff;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${icon} SnaKTox Emergency System</h1>
        <p>AI-Powered Snakebite Emergency Response</p>
    </div>
    
    <div class="content">
        <div class="${this.getAlertClass(type)}">
            <h2>${this.getEmailSubject(type)}</h2>
        </div>
        
        <div style="white-space: pre-line; font-family: monospace; background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid ${headerColor};">
${message}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 4px;">
            <h3>Important Notes:</h3>
            <ul>
                <li>This is an automated message from the SnaKTox Emergency Response System</li>
                <li>All data is verified from WHO, CDC, and KEMRI sources</li>
                <li>For immediate medical emergencies, call emergency services</li>
                <li>Do not reply to this email - it is system-generated</li>
            </ul>
        </div>
    </div>
    
    <div class="footer">
        <p>SnaKTox - Saving Lives Through Technology</p>
        <p>© 2024 SnaKTox Initiative by Maurice Osoro</p>
        <p>Data Sources: WHO, CDC, KEMRI, Ministry of Health Kenya</p>
    </div>
</body>
</html>`;
  }

  private getHeaderColor(type: string): string {
    switch (type) {
      case 'sos_alert':
      case 'emergency':
        return '#ff4444';
      case 'stock_alert':
        return '#ffaa00';
      case 'hospital_update':
        return '#4444ff';
      default:
        return '#666666';
    }
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case 'sos_alert':
      case 'emergency':
        return '🚨';
      case 'stock_alert':
        return '⚠️';
      case 'hospital_update':
        return '🏥';
      default:
        return '📧';
    }
  }

  private getAlertClass(type: string): string {
    switch (type) {
      case 'sos_alert':
      case 'emergency':
        return 'urgent';
      case 'stock_alert':
        return 'warning';
      case 'hospital_update':
        return 'info';
      default:
        return 'info';
    }
  }
}

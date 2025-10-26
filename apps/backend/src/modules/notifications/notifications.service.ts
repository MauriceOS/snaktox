import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TwilioService } from './services/twilio.service';
import { AfricasTalkingService } from './services/africas-talking.service';
import { EmailService } from './services/email.service';

export interface NotificationPayload {
  type: 'sos_alert' | 'hospital_update' | 'stock_alert' | 'emergency';
  recipient: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EmergencyAlert {
  sosReportId: string;
  hospitalId: string;
  responderId: string;
  location: {
    lat: number;
    lng: number;
  };
  snakeSpecies?: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly twilioService: TwilioService,
    private readonly africasTalkingService: AfricasTalkingService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmergencyAlert(alert: EmergencyAlert) {
    this.logger.log(`Sending emergency alert for SOS report: ${alert.sosReportId}`);
    
    try {
      // Get hospital contact information
      const hospital = await this.prisma.hospital.findUnique({
        where: { id: alert.hospitalId },
        select: {
          name: true,
          contactInfo: true,
          antivenomStock: true,
        },
      });

      if (!hospital) {
        this.logger.error(`Hospital not found: ${alert.hospitalId}`);
        return;
      }

      // Prepare emergency message
      const emergencyMessage = this.buildEmergencyMessage(alert, hospital);
      
      // Send notifications to hospital
      await this.sendHospitalNotification(hospital, emergencyMessage, alert);
      
      // Send notifications to emergency contacts
      await this.sendEmergencyContactsNotification(alert, emergencyMessage);
      
      // Log the notification
      await this.logNotification({
        type: 'sos_alert',
        recipient: alert.hospitalId,
        message: emergencyMessage,
        data: alert,
        priority: this.getPriorityFromRiskLevel(alert.riskLevel),
      });

      this.logger.log(`Emergency alert sent successfully for SOS report: ${alert.sosReportId}`);
      
    } catch (error) {
      this.logger.error(`Failed to send emergency alert: ${error.message}`);
      throw error;
    }
  }

  async sendHospitalUpdate(hospitalId: string, updateType: string, data: any) {
    this.logger.log(`Sending hospital update for ${hospitalId}: ${updateType}`);
    
    try {
      const hospital = await this.prisma.hospital.findUnique({
        where: { id: hospitalId },
        select: {
          name: true,
          contactInfo: true,
        },
      });

      if (!hospital) {
        this.logger.error(`Hospital not found: ${hospitalId}`);
        return;
      }

      const updateMessage = this.buildHospitalUpdateMessage(updateType, data, hospital);
      
      // Send to hospital administrators
      await this.sendHospitalNotification(hospital, updateMessage, { updateType, data });
      
      // Log the notification
      await this.logNotification({
        type: 'hospital_update',
        recipient: hospitalId,
        message: updateMessage,
        data: { updateType, data },
        priority: 'medium',
      });

      this.logger.log(`Hospital update sent successfully for ${hospitalId}`);
      
    } catch (error) {
      this.logger.error(`Failed to send hospital update: ${error.message}`);
      throw error;
    }
  }

  async sendStockAlert(hospitalId: string, stockData: any) {
    this.logger.log(`Sending stock alert for hospital: ${hospitalId}`);
    
    try {
      const hospital = await this.prisma.hospital.findUnique({
        where: { id: hospitalId },
        select: {
          name: true,
          contactInfo: true,
        },
      });

      if (!hospital) {
        this.logger.error(`Hospital not found: ${hospitalId}`);
        return;
      }

      const stockMessage = this.buildStockAlertMessage(stockData, hospital);
      
      // Send to hospital administrators
      await this.sendHospitalNotification(hospital, stockMessage, stockData);
      
      // Log the notification
      await this.logNotification({
        type: 'stock_alert',
        recipient: hospitalId,
        message: stockMessage,
        data: stockData,
        priority: stockData.quantity < 5 ? 'high' : 'medium',
      });

      this.logger.log(`Stock alert sent successfully for hospital: ${hospitalId}`);
      
    } catch (error) {
      this.logger.error(`Failed to send stock alert: ${error.message}`);
      throw error;
    }
  }

  async sendBulkNotification(recipients: string[], message: string, type: string) {
    this.logger.log(`Sending bulk notification to ${recipients.length} recipients`);
    
    try {
      const results = await Promise.allSettled(
        recipients.map(recipient => this.sendNotification({
          type: type as any,
          recipient,
          message,
          priority: 'medium',
        }))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      this.logger.log(`Bulk notification completed: ${successful} successful, ${failed} failed`);
      
      return {
        total: recipients.length,
        successful,
        failed,
        results,
      };
      
    } catch (error) {
      this.logger.error(`Failed to send bulk notification: ${error.message}`);
      throw error;
    }
  }

  private async sendNotification(payload: NotificationPayload) {
    const { type, recipient, message, priority } = payload;
    
    try {
      // Determine the best communication method based on recipient and priority
      const method = this.determineCommunicationMethod(recipient, priority);
      
      switch (method) {
        case 'sms':
          await this.twilioService.sendSMS(recipient, message);
          break;
        case 'whatsapp':
          await this.africasTalkingService.sendWhatsApp(recipient, message);
          break;
        case 'email':
          await this.emailService.sendEmail(recipient, message, type);
          break;
        default:
          this.logger.warn(`Unknown communication method: ${method}`);
      }
      
    } catch (error) {
      this.logger.error(`Failed to send notification to ${recipient}: ${error.message}`);
      throw error;
    }
  }

  private async sendHospitalNotification(hospital: any, message: string, data: any) {
    const contactInfo = hospital.contactInfo;
    
    // Send to emergency contact
    if (contactInfo.emergency) {
      await this.sendNotification({
        type: 'emergency',
        recipient: contactInfo.emergency,
        message,
        data,
        priority: 'critical',
      });
    }
    
    // Send to general contact
    if (contactInfo.phone) {
      await this.sendNotification({
        type: 'hospital_update',
        recipient: contactInfo.phone,
        message,
        data,
        priority: 'high',
      });
    }
    
    // Send email if available
    if (contactInfo.email) {
      await this.sendNotification({
        type: 'hospital_update',
        recipient: contactInfo.email,
        message,
        data,
        priority: 'medium',
      });
    }
  }

  private async sendEmergencyContactsNotification(alert: EmergencyAlert, message: string) {
    // Send to emergency services
    const emergencyContacts = [
      '+254-999', // Emergency services
      '+254-20-2726300', // Kenyatta National Hospital
    ];
    
    for (const contact of emergencyContacts) {
      await this.sendNotification({
        type: 'emergency',
        recipient: contact,
        message,
        data: alert,
        priority: 'critical',
      });
    }
  }

  private buildEmergencyMessage(alert: EmergencyAlert, hospital: any): string {
    const location = `Location: ${alert.location.lat}, ${alert.location.lng}`;
    const snakeInfo = alert.snakeSpecies ? `Snake: ${alert.snakeSpecies}` : 'Snake: Unknown';
    const riskInfo = `Risk Level: ${alert.riskLevel}`;
    const timeInfo = `Time: ${alert.timestamp.toISOString()}`;
    
    return `🚨 EMERGENCY ALERT 🚨
    
SNAKEBITE INCIDENT REPORTED

${snakeInfo}
${riskInfo}
${location}
${timeInfo}

Assigned Hospital: ${hospital.name}
Antivenom Available: ${hospital.antivenomStock ? 'Yes' : 'Check stock'}

Responder ID: ${alert.responderId}
SOS Report ID: ${alert.sosReportId}

IMMEDIATE ACTION REQUIRED
Contact: ${hospital.contactInfo.emergency || hospital.contactInfo.phone}`;
  }

  private buildHospitalUpdateMessage(updateType: string, data: any, hospital: any): string {
    return `🏥 HOSPITAL UPDATE

Hospital: ${hospital.name}
Update Type: ${updateType}
Details: ${JSON.stringify(data)}
Time: ${new Date().toISOString()}

Please review and take necessary action.`;
  }

  private buildStockAlertMessage(stockData: any, hospital: any): string {
    const urgency = stockData.quantity < 5 ? '🚨 CRITICAL' : '⚠️ WARNING';
    
    return `${urgency} STOCK ALERT

Hospital: ${hospital.name}
Antivenom Type: ${stockData.antivenomType}
Current Stock: ${stockData.quantity}
Expiry Date: ${stockData.expiryDate}
Status: ${stockData.status}

Action Required: ${stockData.quantity < 5 ? 'URGENT RESTOCK NEEDED' : 'Monitor stock levels'}

Time: ${new Date().toISOString()}`;
  }

  private determineCommunicationMethod(recipient: string, priority: string): string {
    // For critical alerts, prefer SMS/WhatsApp
    if (priority === 'critical') {
      return recipient.includes('@') ? 'email' : 'sms';
    }
    
    // For high priority, use SMS
    if (priority === 'high') {
      return 'sms';
    }
    
    // For medium/low priority, use email if available
    if (recipient.includes('@')) {
      return 'email';
    }
    
    // Default to SMS
    return 'sms';
  }

  private getPriorityFromRiskLevel(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'critical';
      case 'HIGH':
        return 'high';
      case 'MODERATE':
        return 'medium';
      case 'LOW':
        return 'low';
      default:
        return 'medium';
    }
  }

  private async logNotification(payload: NotificationPayload) {
    try {
      await this.prisma.analyticsLog.create({
        data: {
          eventType: 'notification_sent',
          metadata: {
            type: payload.type,
            recipient: payload.recipient,
            priority: payload.priority,
            messageLength: payload.message.length,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log notification: ${error.message}`);
    }
  }
}

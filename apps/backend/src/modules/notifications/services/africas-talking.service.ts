import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { first } from 'rxjs/operators';

@Injectable()
export class AfricasTalkingService {
  private readonly logger = new Logger(AfricasTalkingService.name);
  private readonly username: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.username = this.configService.get('AFRICASTALKING_USERNAME');
    this.apiKey = this.configService.get('AFRICASTALKING_API_KEY');
    this.baseUrl = 'https://api.africastalking.com/version1';
  }

  async sendSMS(to: string, message: string): Promise<void> {
    this.logger.log(`Sending SMS via Africa's Talking to ${to}`);
    
    try {
      const response = await this.httpService.post(
          `${this.baseUrl}/messaging`,
          new URLSearchParams({
            username: this.username,
            to: to,
            message: message,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'apiKey': this.apiKey,
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`SMS sent successfully via Africa's Talking to ${to}`);
      
    } catch (error) {
      this.logger.error(`Failed to send SMS via Africa's Talking to ${to}: ${error.message}`);
      throw new Error(`SMS delivery failed: ${error.message}`);
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<void> {
    this.logger.log(`Sending WhatsApp message via Africa's Talking to ${to}`);
    
    try {
      const response = await this.httpService.post(
          `${this.baseUrl}/whatsapp/message`,
          {
            to: to,
            message: message,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'apiKey': this.apiKey,
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`WhatsApp message sent successfully via Africa's Talking to ${to}`);
      
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message via Africa's Talking to ${to}: ${error.message}`);
      throw new Error(`WhatsApp delivery failed: ${error.message}`);
    }
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<void> {
    this.logger.log(`Sending bulk SMS to ${recipients.length} recipients via Africa's Talking`);
    
    try {
      const response = await this.httpService.post(
          `${this.baseUrl}/messaging`,
          new URLSearchParams({
            username: this.username,
            to: recipients.join(','),
            message: message,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'apiKey': this.apiKey,
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`Bulk SMS sent successfully via Africa's Talking to ${recipients.length} recipients`);
      
    } catch (error) {
      this.logger.error(`Failed to send bulk SMS via Africa's Talking: ${error.message}`);
      throw new Error(`Bulk SMS delivery failed: ${error.message}`);
    }
  }

  async sendUSSD(phoneNumber: string, sessionId: string, text: string): Promise<void> {
    this.logger.log(`Sending USSD message to ${phoneNumber}`);
    
    try {
      const response = await this.httpService.post(
          `${this.baseUrl}/ussd`,
          {
            phoneNumber: phoneNumber,
            sessionId: sessionId,
            text: text,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'apiKey': this.apiKey,
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`USSD message sent successfully to ${phoneNumber}`);
      
    } catch (error) {
      this.logger.error(`Failed to send USSD message to ${phoneNumber}: ${error.message}`);
      throw new Error(`USSD delivery failed: ${error.message}`);
    }
  }

  async getSMSDeliveryStatus(messageId: string): Promise<any> {
    this.logger.log(`Getting SMS delivery status for message ID: ${messageId}`);
    
    try {
      const response = await this.httpService.get(
          `${this.baseUrl}/messaging`,
          {
            params: {
              username: this.username,
              messageId: messageId,
            },
            headers: {
              'apiKey': this.apiKey,
            },
          }
        ).pipe(first()).toPromise();

      return (response as any).data;
      
    } catch (error) {
      this.logger.error(`Failed to get SMS delivery status: ${error.message}`);
      throw new Error(`Failed to get SMS delivery status: ${error.message}`);
    }
  }

  async getAccountBalance(): Promise<any> {
    this.logger.log('Getting Africa\'s Talking account balance');
    
    try {
      const response = await this.httpService.get(
          `${this.baseUrl}/user`,
          {
            params: {
              username: this.username,
            },
            headers: {
              'apiKey': this.apiKey,
            },
          }
        ).pipe(first()).toPromise();

      return {
        balance: (response as any).data.balance,
        currency: (response as any).data.currency,
      };
      
    } catch (error) {
      this.logger.error(`Failed to get account balance: ${error.message}`);
      throw new Error(`Failed to get account balance: ${error.message}`);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { first } from 'rxjs/operators';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly phoneNumber: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    this.authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.phoneNumber = this.configService.get('TWILIO_PHONE_NUMBER');
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
  }

  async sendSMS(to: string, message: string): Promise<void> {
    this.logger.log(`Sending SMS to ${to}`);
    
    try {
      const response = await this.httpService.post(
          `${this.baseUrl}/Messages.json`,
          new URLSearchParams({
            From: this.phoneNumber,
            To: to,
            Body: message,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`SMS sent successfully to ${to}. SID: ${(response as any).data.sid}`);
      
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      throw new Error(`SMS delivery failed: ${error.message}`);
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<void> {
    this.logger.log(`Sending WhatsApp message to ${to}`);
    
    try {
      // Format WhatsApp number (remove + and add whatsapp: prefix)
      const whatsappNumber = `whatsapp:${to.replace('+', '')}`;
      const fromNumber = `whatsapp:${this.phoneNumber.replace('+', '')}`;
      
      const response = await this.httpService.post(
          `${this.baseUrl}/Messages.json`,
          new URLSearchParams({
            From: fromNumber,
            To: whatsappNumber,
            Body: message,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`WhatsApp message sent successfully to ${to}. SID: ${(response as any).data.sid}`);
      
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${to}: ${error.message}`);
      throw new Error(`WhatsApp delivery failed: ${error.message}`);
    }
  }

  async sendVoiceCall(to: string, message: string): Promise<void> {
    this.logger.log(`Sending voice call to ${to}`);
    
    try {
      // Create TwiML for voice message
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
</Response>`;

      const response = await this.httpService.post(
          `${this.baseUrl}/Calls.json`,
          new URLSearchParams({
            From: this.phoneNumber,
            To: to,
            Twiml: twiml,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            },
          }
        ).pipe(first()).toPromise();

      this.logger.log(`Voice call initiated successfully to ${to}. SID: ${(response as any).data.sid}`);
      
    } catch (error) {
      this.logger.error(`Failed to send voice call to ${to}: ${error.message}`);
      throw new Error(`Voice call failed: ${error.message}`);
    }
  }

  async getMessageStatus(messageSid: string): Promise<any> {
    this.logger.log(`Getting message status for SID: ${messageSid}`);
    
    try {
      const response = await this.httpService.get(
          `${this.baseUrl}/Messages/${messageSid}.json`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            },
          }
        ).pipe(first()).toPromise();

      return {
        sid: (response as any).data.sid,
        status: (response as any).data.status,
        to: (response as any).data.to,
        from: (response as any).data.from,
        body: (response as any).data.body,
        dateCreated: (response as any).data.date_created,
        dateUpdated: (response as any).data.date_updated,
        errorCode: (response as any).data.error_code,
        errorMessage: (response as any).data.error_message,
      };
      
    } catch (error) {
      this.logger.error(`Failed to get message status: ${error.message}`);
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    this.logger.log(`Validating phone number: ${phoneNumber}`);
    
    try {
      const response = await this.httpService.get(
          `${this.baseUrl}/Lookups/v1/PhoneNumbers/${encodeURIComponent(phoneNumber)}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            },
          }
        ).pipe(first()).toPromise();

      return (response as any).data.valid === true;
      
    } catch (error) {
      this.logger.error(`Failed to validate phone number: ${error.message}`);
      return false;
    }
  }
}

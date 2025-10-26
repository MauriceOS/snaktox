import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService, EmergencyAlert } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('emergency-alert')
  @ApiOperation({ summary: 'Send emergency alert for SOS report' })
  @ApiResponse({ status: 200, description: 'Emergency alert sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid alert data' })
  @ApiBearerAuth()
  async sendEmergencyAlert(@Body() alert: EmergencyAlert) {
    try {
      await this.notificationsService.sendEmergencyAlert(alert);
      return {
        success: true,
        message: 'Emergency alert sent successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to send emergency alert',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('hospital-update')
  @ApiOperation({ summary: 'Send hospital update notification' })
  @ApiResponse({ status: 200, description: 'Hospital update sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiBearerAuth()
  async sendHospitalUpdate(
    @Body() body: { hospitalId: string; updateType: string; data: any }
  ) {
    try {
      await this.notificationsService.sendHospitalUpdate(
        body.hospitalId,
        body.updateType,
        body.data
      );
      return {
        success: true,
        message: 'Hospital update sent successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to send hospital update',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('stock-alert')
  @ApiOperation({ summary: 'Send stock alert notification' })
  @ApiResponse({ status: 200, description: 'Stock alert sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid stock data' })
  @ApiBearerAuth()
  async sendStockAlert(
    @Body() body: { hospitalId: string; stockData: any }
  ) {
    try {
      await this.notificationsService.sendStockAlert(
        body.hospitalId,
        body.stockData
      );
      return {
        success: true,
        message: 'Stock alert sent successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to send stock alert',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('bulk-notification')
  @ApiOperation({ summary: 'Send bulk notification to multiple recipients' })
  @ApiResponse({ status: 200, description: 'Bulk notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid notification data' })
  @ApiBearerAuth()
  async sendBulkNotification(
    @Body() body: { recipients: string[]; message: string; type: string }
  ) {
    try {
      const result = await this.notificationsService.sendBulkNotification(
        body.recipients,
        body.message,
        body.type
      );
      return {
        success: true,
        message: 'Bulk notification sent successfully',
        result,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to send bulk notification',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

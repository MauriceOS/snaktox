import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { DataProtectionService } from './data-protection.service';
import { AuditService } from './audit.service';
import { RegulatoryService } from './regulatory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('compliance')
export class ComplianceController {
  constructor(
    private readonly complianceService: ComplianceService,
    private readonly dataProtectionService: DataProtectionService,
    private readonly auditService: AuditService,
    private readonly regulatoryService: RegulatoryService,
  ) {}

  @Get('overview')
  async getComplianceOverview() {
    return this.complianceService.getComplianceOverview();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async getComplianceDashboard() {
    return this.complianceService.getComplianceDashboard();
  }

  @Get('statistics')
  async getComplianceStatistics() {
    return this.complianceService.getComplianceMetrics();
  }

  @Get('trends')
  async getComplianceTrends(@Query('timeframe') timeframe?: string) {
    return this.complianceService.getComplianceTrends(timeframe);
  }

  @Get('alerts')
  async getComplianceAlerts() {
    return this.complianceService.getComplianceAlerts();
  }

  @Post('alerts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async createComplianceAlert(@Body() alertData: any) {
    return this.complianceService.createComplianceAlert(alertData);
  }

  @Post('validate')
  async validateDataProcessing(
    @Body() validationData: { countryCode: string; dataType: string; purpose: string },
    @Query('userId') userId?: string,
  ) {
    return this.complianceService.validateDataProcessing(
      validationData.countryCode,
      validationData.dataType,
      validationData.purpose,
      userId,
    );
  }

  @Post('audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async performComplianceAudit(
    @Body() auditData: { countryCode: string; auditType: string },
    @Query('userId') userId: string,
  ) {
    return this.complianceService.performComplianceAudit(
      auditData.countryCode,
      auditData.auditType,
      userId,
    );
  }

  @Get('report/:countryCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async generateComplianceReport(
    @Param('countryCode') countryCode: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.complianceService.generateComplianceReport(
      countryCode,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Data Protection endpoints
  @Get('data-protection/status')
  async getDataProtectionStatus() {
    return this.dataProtectionService.getDataProtectionStatus();
  }

  @Get('data-protection/:countryCode')
  async getDataProtectionFramework(@Param('countryCode') countryCode: string) {
    return this.dataProtectionService.validateDataProcessing(countryCode, 'health', 'emergency_response');
  }

  @Get('data-protection/:countryCode/privacy-policy')
  async generatePrivacyPolicy(
    @Param('countryCode') countryCode: string,
    @Query('language') language?: string,
  ) {
    return this.dataProtectionService.generatePrivacyPolicy(countryCode, language);
  }

  @Get('data-protection/:countryCode/retention')
  async checkDataRetention(
    @Param('countryCode') countryCode: string,
    @Query('dataType') dataType: string,
  ) {
    return this.dataProtectionService.checkDataRetention(countryCode, dataType);
  }

  @Get('data-protection/:countryCode/rights')
  async getDataSubjectRights(@Param('countryCode') countryCode: string) {
    return this.dataProtectionService.getDataSubjectRights(countryCode);
  }

  // Audit endpoints
  @Get('audit/history')
  async getAuditHistory(
    @Query('countryCode') countryCode?: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getAuditHistory(countryCode, limit);
  }

  @Get('audit/latest')
  async getLatestAuditResults(@Query('countryCode') countryCode?: string) {
    return this.auditService.getLatestAuditResults(countryCode);
  }

  @Get('audit/statistics')
  async getAuditStatistics() {
    return this.auditService.getAuditStatistics();
  }

  // Regulatory endpoints
  @Get('regulatory/overview')
  async getRegulatoryCompliance() {
    return this.regulatoryService.getRegulatoryCompliance();
  }

  @Get('regulatory/:countryCode')
  async getRegulatoryFramework(@Param('countryCode') countryCode: string) {
    return this.regulatoryService.getRegulatoryFramework(countryCode);
  }

  @Get('regulatory/:countryCode/requirements')
  async checkComplianceRequirements(
    @Param('countryCode') countryCode: string,
    @Query('serviceType') serviceType: string,
  ) {
    return this.regulatoryService.checkComplianceRequirements(countryCode, serviceType);
  }

  @Get('regulatory/:countryCode/checklist')
  async getComplianceChecklist(@Param('countryCode') countryCode: string) {
    return this.regulatoryService.getComplianceChecklist(countryCode);
  }

  @Get('regulatory/:countryCode/contacts')
  async getRegulatoryContacts(@Param('countryCode') countryCode: string) {
    return this.regulatoryService.getRegulatoryContacts(countryCode);
  }

  @Get('regulatory/updates')
  async getRegulatoryUpdates() {
    return this.regulatoryService.getRegulatoryUpdates();
  }

  @Get('regulatory/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async getRegulatoryDashboard() {
    return this.regulatoryService.getRegulatoryDashboard();
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegionalService } from './regional.service';
import { CountryService } from './country.service';
import { LanguageService } from './language.service';
import { ComplianceService } from './compliance.service';
import { PartnershipService } from './partnership.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('regional')
export class RegionalController {
  constructor(
    private readonly regionalService: RegionalService,
    private readonly countryService: CountryService,
    private readonly languageService: LanguageService,
    private readonly complianceService: ComplianceService,
    private readonly partnershipService: PartnershipService,
  ) {}

  @Get('overview')
  async getRegionalOverview() {
    return this.regionalService.getRegionalOverview();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'HOSPITAL_ADMIN')
  async getRegionalDashboard() {
    return this.regionalService.getRegionalDashboard();
  }

  @Get('statistics')
  async getRegionalStatistics() {
    return this.regionalService.getRegionalStatistics();
  }

  @Get('trends')
  async getRegionalTrends(@Query('timeframe') timeframe?: string) {
    return this.regionalService.getRegionalTrends(timeframe);
  }

  @Get('alerts')
  async getRegionalAlerts() {
    return this.regionalService.getRegionalAlerts();
  }

  @Post('alerts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async createRegionalAlert(@Body() alertData: any) {
    return this.regionalService.createRegionalAlert(alertData);
  }

  // Country endpoints
  @Get('countries')
  async getAllCountries() {
    return this.countryService.getAllCountries();
  }

  @Get('countries/active')
  async getActiveCountries() {
    return this.countryService.getActiveCountries();
  }

  @Get('countries/:code')
  async getCountryByCode(@Param('code') code: string) {
    return this.countryService.getCountryByCode(code);
  }

  @Get('countries/:code/statistics')
  async getCountryStatistics(@Param('code') code: string) {
    return this.countryService.getCountryStatistics(code);
  }

  @Get('countries/:code/performance')
  async getCountryPerformance(@Param('code') code: string) {
    return this.regionalService.getCountryPerformance(code);
  }

  @Get('countries/:code/compliance')
  async getCountryCompliance(@Param('code') code: string) {
    return this.countryService.getCountryCompliance(code);
  }

  @Get('countries/:code/emergency-contacts')
  async getCountryEmergencyContacts(@Param('code') code: string) {
    return this.countryService.getCountryEmergencyContacts(code);
  }

  @Get('countries/:code/health-data')
  async getCountryHealthData(@Param('code') code: string) {
    return this.countryService.getCountryHealthData(code);
  }

  @Post('countries/:code/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async activateCountry(@Param('code') code: string) {
    return this.countryService.activateCountry(code);
  }

  @Post('countries/:code/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async deactivateCountry(@Param('code') code: string) {
    return this.countryService.deactivateCountry(code);
  }

  // Language endpoints
  @Get('languages')
  async getSupportedLanguages() {
    return this.languageService.getSupportedLanguages();
  }

  @Get('languages/active')
  async getActiveLanguages() {
    return this.languageService.getActiveLanguages();
  }

  @Get('languages/:code')
  async getLanguageByCode(@Param('code') code: string) {
    return this.languageService.getLanguageByCode(code);
  }

  @Get('languages/region/:region')
  async getLanguagesByRegion(@Param('region') region: string) {
    return this.languageService.getLanguagesByRegion(region);
  }

  @Get('languages/country/:countryCode')
  async getLanguagesByCountry(@Param('countryCode') countryCode: string) {
    return this.languageService.getLanguagesByCountry(countryCode);
  }

  @Get('languages/:code/content')
  async getContentByLanguage(@Param('code') code: string) {
    return this.languageService.getContentByLanguage(code);
  }

  @Get('languages/:code/resources')
  async getLanguageResources(@Param('code') code: string) {
    return this.languageService.getLanguageResources(code);
  }

  @Get('languages/statistics')
  async getLanguageStatistics() {
    return this.languageService.getLanguageStatistics();
  }

  @Get('languages/coverage')
  async getTranslationCoverage() {
    return this.languageService.getTranslationCoverage();
  }

  @Post('languages/:code/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async activateLanguage(@Param('code') code: string) {
    return this.languageService.activateLanguage(code);
  }

  @Post('languages/:code/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async deactivateLanguage(@Param('code') code: string) {
    return this.languageService.deactivateLanguage(code);
  }

  // Compliance endpoints
  @Get('compliance/:countryCode')
  async getComplianceFramework(@Param('countryCode') countryCode: string) {
    return this.complianceService.getComplianceFramework(countryCode);
  }

  @Post('compliance/:countryCode/validate')
  async validateDataProcessing(
    @Param('countryCode') countryCode: string,
    @Body() validationData: { dataType: string; purpose: string },
  ) {
    return this.complianceService.validateDataProcessing(
      countryCode,
      validationData.dataType,
      validationData.purpose,
    );
  }

  @Get('compliance/:countryCode/retention')
  async checkDataRetention(
    @Param('countryCode') countryCode: string,
    @Query('dataType') dataType: string,
  ) {
    return this.complianceService.checkDataRetention(countryCode, dataType);
  }

  @Get('compliance/:countryCode/rights')
  async getDataSubjectRights(@Param('countryCode') countryCode: string) {
    return this.complianceService.getDataSubjectRights(countryCode);
  }

  @Get('compliance/:countryCode/contact')
  async getDataProtectionContact(@Param('countryCode') countryCode: string) {
    return this.complianceService.getDataProtectionContact(countryCode);
  }

  @Get('compliance/:countryCode/privacy-policy')
  async generatePrivacyPolicy(
    @Param('countryCode') countryCode: string,
    @Query('language') language?: string,
  ) {
    return this.complianceService.generatePrivacyPolicy(countryCode, language);
  }

  @Get('compliance/:countryCode/audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async auditCompliance(@Param('countryCode') countryCode: string) {
    return this.complianceService.auditCompliance(countryCode);
  }

  // Partnership endpoints
  @Get('partnerships')
  async getAllPartnerships() {
    return this.partnershipService.getAllPartnerships();
  }

  @Get('partnerships/active')
  async getActivePartnerships() {
    return this.partnershipService.getActivePartnerships();
  }

  @Get('partnerships/:id')
  async getPartnershipById(@Param('id') id: string) {
    return this.partnershipService.getPartnershipById(id);
  }

  @Get('partnerships/country/:countryCode')
  async getPartnershipsByCountry(@Param('countryCode') countryCode: string) {
    return this.partnershipService.getPartnershipsByCountry(countryCode);
  }

  @Get('partnerships/type/:type')
  async getPartnershipsByType(@Param('type') type: string) {
    return this.partnershipService.getPartnershipsByType(type);
  }

  @Get('partnerships/statistics')
  async getPartnershipStatistics() {
    return this.partnershipService.getPartnershipStatistics();
  }

  @Get('partnerships/impact')
  async getPartnershipImpact() {
    return this.partnershipService.getPartnershipImpact();
  }

  @Get('partnerships/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async getPartnershipDashboard() {
    return this.partnershipService.getPartnershipDashboard();
  }

  @Post('partnerships/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async updatePartnershipStatus(
    @Param('id') id: string,
    @Body() statusData: { status: string },
  ) {
    return this.partnershipService.updatePartnershipStatus(id, statusData.status);
  }

  @Post('partnerships/:id/agreement')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async addPartnershipAgreement(
    @Param('id') id: string,
    @Body() agreementData: { agreement: string },
  ) {
    return this.partnershipService.addPartnershipAgreement(id, agreementData.agreement);
  }

  @Post('partnerships/:id/meeting')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN')
  async createPartnershipMeeting(
    @Param('id') id: string,
    @Body() meetingData: any,
  ) {
    return this.partnershipService.createPartnershipMeeting(id, meetingData);
  }

  @Get('partnerships/:id/meetings')
  async getPartnershipMeetings(@Param('id') id: string) {
    return this.partnershipService.getPartnershipMeetings(id);
  }
}

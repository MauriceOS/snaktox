import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DataProtectionService } from './data-protection.service';
import { AuditService } from './audit.service';
import { RegulatoryService } from './regulatory.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dataProtectionService: DataProtectionService,
    private readonly auditService: AuditService,
    private readonly regulatoryService: RegulatoryService,
  ) {}

  async getComplianceOverview() {
    this.logger.log('Getting compliance overview');
    
    const dataProtectionStatus = await this.dataProtectionService.getDataProtectionStatus();
    const auditResults = await this.auditService.getLatestAuditResults();
    const regulatoryCompliance = await this.regulatoryService.getRegulatoryCompliance();
    
    return {
      dataProtection: dataProtectionStatus,
      auditResults,
      regulatoryCompliance,
      lastUpdated: new Date().toISOString(),
    };
  }

  async validateDataProcessing(
    countryCode: string,
    dataType: string,
    purpose: string,
    userId?: string,
  ) {
    this.logger.log(`Validating data processing for ${countryCode}: ${dataType} - ${purpose}`);
    
    const validation = await this.dataProtectionService.validateDataProcessing(
      countryCode,
      dataType,
      purpose,
    );

    // Log validation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'compliance_validation',
        userId,
        metadata: {
          countryCode,
          dataType,
          purpose,
          isCompliant: validation.isCompliant,
          requirements: validation.requirements,
          validatedAt: new Date().toISOString(),
        },
      },
    });

    return validation;
  }

  async performComplianceAudit(countryCode: string, auditType: string, userId: string) {
    this.logger.log(`Performing compliance audit for ${countryCode}: ${auditType}`);
    
    const audit = await this.auditService.performAudit(countryCode, auditType, userId);
    
    return audit;
  }

  async getComplianceDashboard() {
    this.logger.log('Getting compliance dashboard data');
    
    const [
      overview,
      auditHistory,
      complianceMetrics,
      regulatoryUpdates,
    ] = await Promise.all([
      this.getComplianceOverview(),
      this.auditService.getAuditHistory(),
      this.getComplianceMetrics(),
      this.regulatoryService.getRegulatoryUpdates(),
    ]);

    return {
      overview,
      auditHistory,
      complianceMetrics,
      regulatoryUpdates,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getComplianceMetrics() {
    this.logger.log('Getting compliance metrics');
    
    const totalValidations = await this.prisma.analyticsLog.count({
      where: { eventType: 'compliance_validation' },
    });

    const compliantValidations = await this.prisma.analyticsLog.count({
      where: {
        eventType: 'compliance_validation',
        metadata: {
          path: ['isCompliant'],
          equals: true,
        } as any, // MongoDB compatibility fix
      },
    });

    const totalAudits = await this.prisma.analyticsLog.count({
      where: { eventType: 'compliance_audit' },
    });

    const recentAudits = await this.prisma.analyticsLog.findMany({
      where: { eventType: 'compliance_audit' },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    const averageComplianceScore = recentAudits.length > 0
      ? recentAudits.reduce((sum, audit) => sum + (audit.metadata['complianceScore'] || 0), 0) / recentAudits.length
      : 0;

    return {
      totalValidations,
      compliantValidations,
      complianceRate: totalValidations > 0 ? Math.round((compliantValidations / totalValidations) * 100) : 0,
      totalAudits,
      averageComplianceScore: Math.round(averageComplianceScore),
      lastAuditDate: recentAudits.length > 0 ? recentAudits[0].timestamp : null,
    };
  }

  async generateComplianceReport(countryCode: string, startDate: Date, endDate: Date) {
    this.logger.log(`Generating compliance report for ${countryCode} from ${startDate} to ${endDate}`);
    
    const validations = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'compliance_validation',
        metadata: {
          path: ['countryCode'],
          equals: countryCode,
        } as any, // MongoDB compatibility fix
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const audits = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'compliance_audit',
        metadata: {
          path: ['countryCode'],
          equals: countryCode,
        } as any, // MongoDB compatibility fix
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const report = {
      countryCode,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      validations: {
        total: validations.length,
        compliant: validations.filter(v => v.metadata['isCompliant']).length,
        nonCompliant: validations.filter(v => !v.metadata['isCompliant']).length,
        complianceRate: validations.length > 0 
          ? Math.round((validations.filter(v => v.metadata['isCompliant']).length / validations.length) * 100)
          : 0,
      },
      audits: {
        total: audits.length,
        averageScore: audits.length > 0
          ? Math.round(audits.reduce((sum, audit) => sum + (audit.metadata['complianceScore'] || 0), 0) / audits.length)
          : 0,
        findings: audits.flatMap(audit => audit.metadata['findings'] || []),
        recommendations: audits.flatMap(audit => audit.metadata['recommendations'] || []),
      },
      generatedAt: new Date().toISOString(),
    };

    // Log report generation
    await this.prisma.analyticsLog.create({
      data: {
        eventType: 'compliance_report_generated',
        metadata: {
          countryCode,
          reportType: 'compliance_summary',
          period: report.period,
          validations: report.validations.total,
          audits: report.audits.total,
          generatedAt: report.generatedAt,
        },
      },
    });

    return report;
  }

  async getComplianceAlerts() {
    this.logger.log('Getting compliance alerts');
    
    const alerts = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'compliance_alert',
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return alerts.map(alert => ({
      id: alert.id,
      ...(alert.metadata as any || {}),
      timestamp: alert.timestamp,
    }));
  }

  async createComplianceAlert(alertData: any) {
    this.logger.log(`Creating compliance alert: ${alertData.title}`);
    
    const alert = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'compliance_alert',
        metadata: {
          title: alertData.title,
          description: alertData.description,
          severity: alertData.severity,
          countryCode: alertData.countryCode,
          alertType: alertData.alertType,
          createdBy: alertData.createdBy,
          createdAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Compliance alert created with ID: ${alert.id}`);
    return {
      id: alert.id,
      ...(alert.metadata as any || {}),
      timestamp: alert.timestamp,
    };
  }

  async getComplianceTrends(timeframe: string = '30d') {
    this.logger.log(`Getting compliance trends for timeframe: ${timeframe}`);
    
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await this.prisma.analyticsLog.groupBy({
      by: ['eventType'],
      where: {
        eventType: {
          in: ['compliance_validation', 'compliance_audit', 'compliance_alert'],
        },
        timestamp: {
          gte: startDate,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
    });

    return trends.map(trend => ({
      eventType: trend.eventType,
      count: trend._count,
    }));
  }
}

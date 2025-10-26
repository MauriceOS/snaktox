import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { DataProtectionService } from './data-protection.service';
import { AuditService } from './audit.service';
import { RegulatoryService } from './regulatory.service';
import { RegionalModule } from '../regional/regional.module';

@Module({
  imports: [RegionalModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    DataProtectionService,
    AuditService,
    RegulatoryService,
  ],
  exports: [
    ComplianceService,
    DataProtectionService,
    AuditService,
    RegulatoryService,
  ],
})
export class ComplianceModule {}

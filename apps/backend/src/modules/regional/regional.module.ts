import { Module } from '@nestjs/common';
import { RegionalController } from './regional.controller';
import { RegionalService } from './regional.service';
import { CountryService } from './country.service';
import { LanguageService } from './language.service';
import { ComplianceService } from './compliance.service';
import { PartnershipService } from './partnership.service';

@Module({
  controllers: [RegionalController],
  providers: [
    RegionalService,
    CountryService,
    LanguageService,
    ComplianceService,
    PartnershipService,
  ],
  exports: [
    RegionalService,
    CountryService,
    LanguageService,
    ComplianceService,
    PartnershipService,
  ],
})
export class RegionalModule {}

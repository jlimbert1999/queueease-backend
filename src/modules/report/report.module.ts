import { Module } from '@nestjs/common';

import { AdministrationModule } from '../administration/administration.module';
import { TicketingModule } from '../ticketing/ticketing.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TicketingModule, AdministrationModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}

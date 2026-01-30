import { Module } from '@nestjs/common';
import { LeadStatusService } from './lead-status.service.js';
import { LeadStatusController } from './lead-status.controller.js';

@Module({
  controllers: [LeadStatusController],
  providers: [LeadStatusService],
  exports: [LeadStatusService],
})
export class LeadStatusModule {}

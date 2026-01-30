import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service.js';
import { AssignmentController } from './assignment.controller.js';

@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}

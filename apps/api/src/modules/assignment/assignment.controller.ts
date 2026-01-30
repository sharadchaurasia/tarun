import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { AssignmentService } from './assignment.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole, AssignmentStrategy } from '@prisma/client';

@Controller('api/assignment-rules')
export class AssignmentController {
  constructor(private assignmentService: AssignmentService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.assignmentService.findAllRules(user.tenantId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  create(
    @CurrentUser() user: any,
    @Body()
    body: {
      name: string;
      priority?: number;
      strategy?: AssignmentStrategy;
      conditions?: Record<string, any>;
      teamId?: string;
    },
  ) {
    return this.assignmentService.createRule(user.tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      priority?: number;
      strategy?: AssignmentStrategy;
      isActive?: boolean;
      conditions?: Record<string, any>;
      teamId?: string | null;
    },
  ) {
    return this.assignmentService.updateRule(user.tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.assignmentService.deleteRule(user.tenantId, id);
  }
}

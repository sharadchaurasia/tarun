import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { LeadStatusService } from './lead-status.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('api/lead-statuses')
export class LeadStatusController {
  constructor(private leadStatusService: LeadStatusService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.leadStatusService.findAll(user.tenantId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  create(
    @CurrentUser() user: any,
    @Body() body: { name: string; color?: string; sortOrder?: number },
  ) {
    return this.leadStatusService.create(user.tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { name?: string; color?: string; sortOrder?: number; isActive?: boolean },
  ) {
    return this.leadStatusService.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadStatusService.remove(user.tenantId, id);
  }
}

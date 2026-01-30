import { Controller, Get, Patch, Post, Param, Body, Query } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('api/leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('leadStatus') leadStatus?: string,
    @Query('agentId') agentId?: string,
  ) {
    return this.leadsService.findAll(user.tenantId, user, {
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      leadStatus,
      agentId,
    });
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.leadsService.getStats(user.tenantId, user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findOne(user.tenantId, id, user);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { leadStatus: string },
  ) {
    return this.leadsService.updateStatus(user.tenantId, id, body.leadStatus, user);
  }

  @Post(':id/call-log')
  addCallLog(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { notes: string; outcome: string; duration?: number },
  ) {
    return this.leadsService.addCallLog(user.tenantId, id, user, body);
  }

  @Patch(':id/assign')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  reassign(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { agentId: string },
  ) {
    return this.leadsService.reassign(user.tenantId, id, body.agentId);
  }
}

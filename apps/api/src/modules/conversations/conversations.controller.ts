import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ConversationStatus } from '@prisma/client';

@Controller('api/conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: ConversationStatus,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.conversationsService.findAll(user.tenantId, {
      status,
      assignedAgentId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.conversationsService.findOne(user.tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { status: ConversationStatus },
  ) {
    return this.conversationsService.updateStatus(user.tenantId, id, body.status);
  }

  @Patch(':id/assign')
  assign(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { agentId: string | null },
  ) {
    return this.conversationsService.assign(user.tenantId, id, body.agentId);
  }

  @Get(':id/notes')
  getNotes(@CurrentUser() user: any, @Param('id') id: string) {
    return this.conversationsService.getNotes(user.tenantId, id);
  }

  @Post(':id/notes')
  addNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.conversationsService.addNote(user.tenantId, id, user.id, body.content);
  }

  @Patch(':id/lead-status')
  updateLeadStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { leadStatus: string },
  ) {
    return this.conversationsService.updateLeadStatus(user.tenantId, id, body.leadStatus);
  }
}

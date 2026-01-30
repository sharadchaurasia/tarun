import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('api/chatbot/workflows')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.chatbotService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatbotService.findOne(user.tenantId, id);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  create(
    @CurrentUser() user: any,
    @Body() body: { name: string; description?: string; trigger: any; actions: any[] },
  ) {
    return this.chatbotService.create(user.tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; trigger?: any; actions?: any[]; isActive?: boolean },
  ) {
    return this.chatbotService.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatbotService.remove(user.tenantId, id);
  }

  @Get(':id/logs')
  getLogs(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatbotService.getLogs(user.tenantId, id);
  }
}

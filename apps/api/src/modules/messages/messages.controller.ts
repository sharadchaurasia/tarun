import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { MessagesGateway } from './messages.gateway.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { MessageDirection } from '@prisma/client';

@Controller('api/messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private messagesGateway: MessagesGateway,
  ) {}

  @Get(':conversationId')
  findByConversation(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.findByConversation(user.tenantId, conversationId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post(':conversationId')
  async send(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Body() body: { body: string },
  ) {
    const message = await this.messagesService.create({
      tenantId: user.tenantId,
      conversationId,
      senderId: user.id,
      direction: MessageDirection.OUTBOUND,
      body: body.body,
    });

    this.messagesGateway.emitToTenant(user.tenantId, 'message:new', message);

    return message;
  }
}

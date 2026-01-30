import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MessageDirection, MessageStatus } from '@prisma/client';
import { ChatbotEngineService } from '../chatbot/chatbot-engine.service.js';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private prisma: PrismaService,
    private chatbotEngine: ChatbotEngineService,
  ) {}

  async findByConversation(
    tenantId: string,
    conversationId: string,
    opts: { page?: number; limit?: number } = {},
  ) {
    const page = opts.page || 1;
    const limit = opts.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { tenantId, conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true } },
        },
      }),
      this.prisma.message.count({ where: { tenantId, conversationId } }),
    ]);

    return { data, total, page, limit };
  }

  async create(data: {
    tenantId: string;
    conversationId: string;
    senderId?: string;
    direction: MessageDirection;
    body: string;
    externalId?: string;
  }) {
    const message = await this.prisma.message.create({
      data: {
        tenantId: data.tenantId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        direction: data.direction,
        body: data.body,
        externalId: data.externalId,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    // Update conversation lastMessageAt
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: message.createdAt },
    });

    // Trigger chatbot workflows for inbound messages
    if (data.direction === 'INBOUND') {
      const messageCount = await this.prisma.message.count({
        where: { conversationId: data.conversationId },
      });
      this.chatbotEngine
        .onNewMessage(data.tenantId, data.conversationId, data.body, messageCount === 1)
        .catch((err) => this.logger.error(`Chatbot engine error: ${err.message}`));
    }

    return message;
  }
}

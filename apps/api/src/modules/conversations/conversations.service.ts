import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ConversationStatus } from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    opts: { status?: ConversationStatus; assignedAgentId?: string; page?: number; limit?: number } = {},
  ) {
    const page = opts.page || 1;
    const limit = opts.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (opts.status) where.status = opts.status;
    if (opts.assignedAgentId) where.assignedAgentId = opts.assignedAgentId;

    const [data, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          contact: { select: { id: true, name: true, phone: true } },
          assignedAgent: { select: { id: true, name: true, email: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { body: true, direction: true, createdAt: true },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.conversation.findFirstOrThrow({
      where: { id, tenantId },
      include: {
        contact: true,
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateStatus(tenantId: string, id: string, status: ConversationStatus) {
    const convo = await this.prisma.conversation.findFirstOrThrow({
      where: { id, tenantId },
    });

    // Validate transitions
    if (convo.status === ConversationStatus.RESOLVED && status === ConversationStatus.OPEN) {
      // Reopen allowed
    } else if (convo.status === status) {
      throw new BadRequestException('Conversation already has this status');
    }

    return this.prisma.conversation.update({
      where: { id },
      data: { status },
      include: {
        contact: { select: { id: true, name: true, phone: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async assign(tenantId: string, id: string, agentId: string | null) {
    return this.prisma.conversation.update({
      where: { id, tenantId },
      data: { assignedAgentId: agentId },
      include: {
        contact: { select: { id: true, name: true, phone: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getNotes(tenantId: string, conversationId: string) {
    return this.prisma.conversationNote.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async addNote(tenantId: string, conversationId: string, userId: string, content: string) {
    return this.prisma.conversationNote.create({
      data: {
        content,
        tenant: { connect: { id: tenantId } },
        conversation: { connect: { id: conversationId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async updateLeadStatus(tenantId: string, id: string, leadStatus: string) {
    return this.prisma.conversation.update({
      where: { id, tenantId },
      data: { leadStatus },
      include: {
        contact: { select: { id: true, name: true, phone: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRole } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    user: { id: string; role: UserRole },
    opts: {
      search?: string;
      page?: number;
      limit?: number;
      leadStatus?: string;
      agentId?: string;
    } = {},
  ) {
    const page = opts.page || 1;
    const limit = opts.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      leadStatus: { not: null },
    };

    // AGENT can only see their own leads
    if (user.role === UserRole.AGENT) {
      where.assignedAgentId = user.id;
    } else if (opts.agentId) {
      where.assignedAgentId = opts.agentId;
    }

    if (opts.leadStatus) {
      where.leadStatus = opts.leadStatus;
    }

    if (opts.search) {
      where.contact = {
        OR: [
          { name: { contains: opts.search, mode: 'insensitive' } },
          { phone: { contains: opts.search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          contact: { select: { id: true, name: true, phone: true, email: true } },
          assignedAgent: { select: { id: true, name: true, email: true } },
          _count: { select: { callLogs: true, messages: true } },
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

  async getStats(tenantId: string, user: { id: string; role: UserRole }) {
    const baseWhere: any = {
      tenantId,
      leadStatus: { not: null },
    };

    if (user.role === UserRole.AGENT) {
      baseWhere.assignedAgentId = user.id;
    }

    // Get custom statuses for this tenant
    const customStatuses = await this.prisma.customLeadStatus.findMany({
      where: { tenantId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const statusNames = customStatuses.map((s) => s.name);

    const counts = await Promise.all(
      statusNames.map((status) =>
        this.prisma.conversation.count({
          where: { ...baseWhere, leadStatus: status },
        }),
      ),
    );

    const stats: Record<string, number> = {};
    statusNames.forEach((status, i) => {
      stats[status] = counts[i];
    });
    stats.TOTAL = counts.reduce((a, b) => a + b, 0);

    return stats;
  }

  async findOne(
    tenantId: string,
    id: string,
    user: { id: string; role: UserRole },
  ) {
    const conversation = await this.prisma.conversation.findFirstOrThrow({
      where: { id, tenantId, leadStatus: { not: null } },
      include: {
        contact: { select: { id: true, name: true, phone: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
        callLogs: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
        messages: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, body: true, direction: true, createdAt: true },
        },
        _count: { select: { callLogs: true, messages: true } },
      },
    });

    if (user.role === UserRole.AGENT && conversation.assignedAgentId !== user.id) {
      throw new ForbiddenException('You can only view your own leads');
    }

    return conversation;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    leadStatus: string,
    user: { id: string; role: UserRole },
  ) {
    const conversation = await this.prisma.conversation.findFirstOrThrow({
      where: { id, tenantId, leadStatus: { not: null } },
    });

    if (user.role === UserRole.AGENT && conversation.assignedAgentId !== user.id) {
      throw new ForbiddenException('You can only update your own leads');
    }

    return this.prisma.conversation.update({
      where: { id },
      data: { leadStatus },
      include: {
        contact: { select: { id: true, name: true, phone: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async addCallLog(
    tenantId: string,
    conversationId: string,
    user: { id: string; role: UserRole },
    data: { notes: string; outcome: string; duration?: number },
  ) {
    const conversation = await this.prisma.conversation.findFirstOrThrow({
      where: { id: conversationId, tenantId, leadStatus: { not: null } },
    });

    if (user.role === UserRole.AGENT && conversation.assignedAgentId !== user.id) {
      throw new ForbiddenException('You can only add call logs to your own leads');
    }

    // Auto-advance from "New lead" to "Connected" on first call log
    if (conversation.leadStatus === 'New lead') {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { leadStatus: 'Connected' },
      });
    }

    return this.prisma.callLog.create({
      data: {
        tenantId,
        conversationId,
        userId: user.id,
        notes: data.notes,
        outcome: data.outcome,
        duration: data.duration,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async reassign(
    tenantId: string,
    id: string,
    agentId: string,
  ) {
    return this.prisma.conversation.update({
      where: { id, tenantId },
      data: { assignedAgentId: agentId },
      include: {
        contact: { select: { id: true, name: true, phone: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AssignmentStrategy, UserAvailability, UserRole, ConversationStatus } from '@prisma/client';

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(private prisma: PrismaService) {}

  async autoAssign(tenantId: string, conversationId: string): Promise<string | null> {
    const conversation = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: { contact: true },
    });

    // Get active rules sorted by priority (highest first)
    const rules = await this.prisma.assignmentRule.findMany({
      where: { tenantId, isActive: true },
      orderBy: { priority: 'desc' },
      include: { team: true },
    });

    for (const rule of rules) {
      if (!this.matchesConditions(rule.conditions as any, conversation)) {
        continue;
      }

      if (rule.strategy === AssignmentStrategy.MANUAL) {
        this.logger.log(`Rule "${rule.name}" matched - manual assignment required`);
        return null;
      }

      // ROUND_ROBIN
      const agent = await this.findAvailableAgent(tenantId, rule.teamId);
      if (agent) {
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { assignedAgentId: agent.id },
        });
        this.logger.log(`Assigned conversation ${conversationId} to ${agent.name} via rule "${rule.name}"`);
        return agent.id;
      }
    }

    this.logger.warn(`No available agent found for conversation ${conversationId}`);
    return null;
  }

  private matchesConditions(conditions: Record<string, any>, conversation: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    if (conditions.tags && Array.isArray(conditions.tags)) {
      const contactTags = conversation.contact?.tags || [];
      const hasMatchingTag = conditions.tags.some((t: string) => contactTags.includes(t));
      if (!hasMatchingTag) return false;
    }

    if (conditions.channel && conditions.channel !== conversation.channel) {
      return false;
    }

    return true;
  }

  private async findAvailableAgent(tenantId: string, teamId: string | null) {
    const where: any = {
      tenantId,
      availability: UserAvailability.ONLINE,
      role: { in: [UserRole.AGENT, UserRole.ADMIN] },
    };

    if (teamId) {
      where.teamMemberships = { some: { teamId } };
    }

    const agents = await this.prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            assignedConversations: {
              where: { status: { not: ConversationStatus.RESOLVED } },
            },
          },
        },
      },
    });

    if (agents.length === 0) return null;

    // Round-robin with capacity: pick agent with fewest open conversations under capacity
    const available = agents
      .filter((a) => a._count.assignedConversations < a.maxOpenConvo)
      .sort((a, b) => a._count.assignedConversations - b._count.assignedConversations);

    return available[0] || null;
  }

  async findAllRules(tenantId: string) {
    return this.prisma.assignmentRule.findMany({
      where: { tenantId },
      orderBy: { priority: 'desc' },
      include: { team: { select: { id: true, name: true } } },
    });
  }

  async createRule(
    tenantId: string,
    dto: {
      name: string;
      priority?: number;
      strategy?: AssignmentStrategy;
      conditions?: Record<string, any>;
      teamId?: string;
    },
  ) {
    return this.prisma.assignmentRule.create({
      data: {
        tenantId,
        name: dto.name,
        priority: dto.priority || 0,
        strategy: dto.strategy || AssignmentStrategy.ROUND_ROBIN,
        conditions: dto.conditions || {},
        teamId: dto.teamId,
      },
    });
  }

  async updateRule(
    tenantId: string,
    id: string,
    dto: {
      name?: string;
      priority?: number;
      strategy?: AssignmentStrategy;
      isActive?: boolean;
      conditions?: Record<string, any>;
      teamId?: string | null;
    },
  ) {
    return this.prisma.assignmentRule.update({
      where: { id, tenantId },
      data: dto,
    });
  }

  async deleteRule(tenantId: string, id: string) {
    return this.prisma.assignmentRule.delete({ where: { id, tenantId } });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ChatbotService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.chatbotWorkflow.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { logs: true } } },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.chatbotWorkflow.findFirstOrThrow({
      where: { id, tenantId },
      include: {
        logs: {
          take: 20,
          orderBy: { executedAt: 'desc' },
        },
      },
    });
  }

  async create(
    tenantId: string,
    data: { name: string; description?: string; trigger: any; actions: any[] },
  ) {
    return this.prisma.chatbotWorkflow.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description || '',
        trigger: data.trigger,
        actions: data.actions,
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: { name?: string; description?: string; trigger?: any; actions?: any[]; isActive?: boolean },
  ) {
    return this.prisma.chatbotWorkflow.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.chatbotWorkflow.findFirstOrThrow({
      where: { id, tenantId },
    });
    return this.prisma.chatbotWorkflow.delete({ where: { id } });
  }

  async getLogs(tenantId: string, workflowId: string) {
    await this.prisma.chatbotWorkflow.findFirstOrThrow({
      where: { id: workflowId, tenantId },
    });
    return this.prisma.workflowLog.findMany({
      where: { workflowId },
      orderBy: { executedAt: 'desc' },
      take: 50,
    });
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class LeadStatusService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.customLeadStatus.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(
    tenantId: string,
    data: { name: string; color?: string; sortOrder?: number },
  ) {
    // Get max sort order if not provided
    if (data.sortOrder === undefined) {
      const max = await this.prisma.customLeadStatus.findFirst({
        where: { tenantId },
        orderBy: { sortOrder: 'desc' },
      });
      data.sortOrder = (max?.sortOrder ?? -1) + 1;
    }

    return this.prisma.customLeadStatus.create({
      data: {
        tenantId,
        name: data.name,
        color: data.color || '#3b82f6',
        sortOrder: data.sortOrder,
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: { name?: string; color?: string; sortOrder?: number; isActive?: boolean },
  ) {
    // If renaming, also update all conversations that use the old name
    if (data.name) {
      const existing = await this.prisma.customLeadStatus.findFirstOrThrow({
        where: { id, tenantId },
      });
      if (existing.name !== data.name) {
        await this.prisma.conversation.updateMany({
          where: { tenantId, leadStatus: existing.name },
          data: { leadStatus: data.name },
        });
      }
    }

    return this.prisma.customLeadStatus.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const status = await this.prisma.customLeadStatus.findFirstOrThrow({
      where: { id, tenantId },
    });

    // Check if any conversations use this status
    const count = await this.prisma.conversation.count({
      where: { tenantId, leadStatus: status.name },
    });

    if (count > 0) {
      throw new BadRequestException(
        `Cannot delete: ${count} conversation(s) are using this status. Change their status first.`,
      );
    }

    return this.prisma.customLeadStatus.delete({ where: { id } });
  }
}

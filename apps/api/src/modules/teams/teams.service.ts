import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.team.findMany({
      where: { tenantId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, availability: true } } },
        },
        _count: { select: { members: true } },
      },
    });
  }

  async create(tenantId: string, dto: { name: string }) {
    return this.prisma.team.create({
      data: { tenantId, name: dto.name },
    });
  }

  async update(tenantId: string, id: string, dto: { name?: string }) {
    return this.prisma.team.update({
      where: { id, tenantId },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.team.delete({ where: { id, tenantId } });
  }

  async addMember(teamId: string, userId: string) {
    return this.prisma.teamMember.create({
      data: { teamId, userId },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return this.prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async getTeamMembers(teamId: string) {
    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, availability: true, maxOpenConvo: true },
        },
      },
    });
  }
}

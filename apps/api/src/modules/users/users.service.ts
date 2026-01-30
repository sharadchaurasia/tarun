import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRole, UserAvailability } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        availability: true,
        maxOpenConvo: true,
        createdAt: true,
      },
    });
  }

  async invite(tenantId: string, dto: { email: string; name: string; role?: UserRole }) {
    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists in this tenant');
    }

    const passwordHash = await bcrypt.hash('changeme123', 10);
    return this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role || UserRole.AGENT,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        availability: true,
        createdAt: true,
      },
    });
  }

  async update(tenantId: string, userId: string, data: { name?: string; role?: UserRole }) {
    return this.prisma.user.update({
      where: { id: userId, tenantId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        availability: true,
        createdAt: true,
      },
    });
  }

  async updateAvailability(tenantId: string, userId: string, availability: UserAvailability) {
    return this.prisma.user.update({
      where: { id: userId, tenantId },
      data: { availability },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        availability: true,
      },
    });
  }

  async getAvailableAgents(tenantId: string) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        availability: UserAvailability.ONLINE,
        role: { in: [UserRole.AGENT, UserRole.ADMIN] },
      },
      include: {
        _count: {
          select: {
            assignedConversations: {
              where: { status: { not: 'RESOLVED' } },
            },
          },
        },
      },
    });
  }
}

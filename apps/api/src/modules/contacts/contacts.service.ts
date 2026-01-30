import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    opts: { search?: string; page?: number; limit?: number } = {},
  ) {
    const page = opts.page || 1;
    const limit = opts.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { phone: { contains: opts.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { conversations: true } } },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.contact.findFirstOrThrow({
      where: { id, tenantId },
      include: {
        conversations: {
          orderBy: { lastMessageAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async create(tenantId: string, dto: { phone: string; name?: string; email?: string; tags?: string[] }) {
    return this.prisma.contact.create({
      data: {
        tenantId,
        phone: dto.phone,
        name: dto.name,
        email: dto.email,
        tags: dto.tags || [],
      },
    });
  }

  async update(tenantId: string, id: string, dto: { name?: string; email?: string; tags?: string[] }) {
    return this.prisma.contact.update({
      where: { id, tenantId },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.contact.delete({
      where: { id, tenantId },
    });
  }

  async findOrCreateByPhone(tenantId: string, phone: string, name?: string) {
    let contact = await this.prisma.contact.findUnique({
      where: { tenantId_phone: { tenantId, phone } },
    });
    if (!contact) {
      contact = await this.prisma.contact.create({
        data: { tenantId, phone, name },
      });
    }
    return contact;
  }
}

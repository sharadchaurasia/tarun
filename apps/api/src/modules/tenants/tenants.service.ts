import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findOne(tenantId: string) {
    return this.prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });
  }

  async update(tenantId: string, data: { name?: string }) {
    return this.prisma.tenant.update({ where: { id: tenantId }, data });
  }
}

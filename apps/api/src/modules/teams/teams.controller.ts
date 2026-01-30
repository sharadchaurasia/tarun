import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('api/teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.teamsService.findAll(user.tenantId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() body: { name: string }) {
    return this.teamsService.create(user.tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { name?: string }) {
    return this.teamsService.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.teamsService.delete(user.tenantId, id);
  }

  @Post(':id/members')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.teamsService.addMember(id, body.userId);
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }
}

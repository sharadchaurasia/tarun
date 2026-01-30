import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole, UserAvailability } from '@prisma/client';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.tenantId);
  }

  @Post('invite')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  invite(
    @CurrentUser() user: any,
    @Body() body: { email: string; name: string; role?: UserRole },
  ) {
    return this.usersService.invite(user.tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { name?: string; role?: UserRole },
  ) {
    return this.usersService.update(user.tenantId, id, body);
  }

  @Patch(':id/availability')
  updateAvailability(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { availability: UserAvailability },
  ) {
    return this.usersService.updateAvailability(user.tenantId, id, body.availability);
  }
}

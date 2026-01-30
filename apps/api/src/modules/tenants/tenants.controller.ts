import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('api/tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('me')
  getMyTenant(@CurrentUser() user: any) {
    return this.tenantsService.findOne(user.tenantId);
  }

  @Patch('me')
  updateMyTenant(@CurrentUser() user: any, @Body() body: { name?: string }) {
    return this.tenantsService.update(user.tenantId, body);
  }
}

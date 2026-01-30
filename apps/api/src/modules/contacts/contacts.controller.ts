import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('api/contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactsService.findAll(user.tenantId, {
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contactsService.findOne(user.tenantId, id);
  }

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() body: { phone: string; name?: string; email?: string; tags?: string[] },
  ) {
    return this.contactsService.create(user.tenantId, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; tags?: string[] },
  ) {
    return this.contactsService.update(user.tenantId, id, body);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contactsService.delete(user.tenantId, id);
  }
}

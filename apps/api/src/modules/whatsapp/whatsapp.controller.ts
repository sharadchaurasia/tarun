import { Controller, Post, Get, Body, Query, HttpCode } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ConfigService } from '@nestjs/config';

@Controller('api/webhooks/whatsapp')
export class WhatsAppController {
  constructor(
    private whatsappService: WhatsAppService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return 'Verification failed';
  }

  @Public()
  @Post()
  @HttpCode(200)
  async webhook(
    @Body()
    body: {
      tenantId: string;
      from: string;
      name?: string;
      body: string;
      externalId?: string;
    },
  ) {
    return this.whatsappService.handleInboundMessage(body.tenantId, {
      from: body.from,
      name: body.name,
      body: body.body,
      externalId: body.externalId,
    });
  }
}

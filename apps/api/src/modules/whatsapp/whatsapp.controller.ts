import { Controller, Post, Get, Body, Query, HttpCode, Logger } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ConfigService } from '@nestjs/config';

@Controller('api/webhooks/whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

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
  async webhook(@Body() body: any) {
    // Meta webhook format: body.entry exists
    if (body.entry) {
      return this.handleMetaWebhook(body);
    }

    // Legacy simple format (backward compat)
    return this.whatsappService.handleInboundMessage(body.tenantId, {
      from: body.from,
      name: body.name,
      body: body.body,
      externalId: body.externalId,
    });
  }

  private async handleMetaWebhook(body: any) {
    const tenantId = this.configService.get<string>('WHATSAPP_TENANT_ID');
    if (!tenantId) {
      this.logger.error('WHATSAPP_TENANT_ID not configured — cannot process Meta webhook');
      return { status: 'ok' };
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        // Only process incoming messages (skip status updates, etc.)
        if (!value.messages) {
          continue;
        }

        for (const message of value.messages) {
          // Only handle text messages for now
          if (message.type !== 'text') {
            this.logger.warn(`Skipping non-text message type: ${message.type}`);
            continue;
          }

          const contact = value.contacts?.find(
            (c: any) => c.wa_id === message.from,
          );

          try {
            await this.whatsappService.handleInboundMessage(tenantId, {
              from: message.from,
              name: contact?.profile?.name,
              body: message.text.body,
              externalId: message.id,
            });
          } catch (error) {
            this.logger.error(
              `Failed to process message ${message.id}: ${error}`,
            );
          }
        }
      }
    }

    // Meta requires a fast 200 response
    return { status: 'ok' };
  }
}

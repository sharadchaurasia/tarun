import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface WhatsAppMessage {
  to: string;
  body: string;
}

export abstract class WhatsAppProvider {
  abstract sendMessage(message: WhatsAppMessage): Promise<{ externalId: string }>;
}

@Injectable()
export class MockWhatsAppProvider extends WhatsAppProvider {
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  async sendMessage(message: WhatsAppMessage): Promise<{ externalId: string }> {
    const externalId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.logger.log(`[MOCK] Sending WhatsApp message to ${message.to}: "${message.body}" (externalId: ${externalId})`);
    return { externalId };
  }
}

@Injectable()
export class CloudWhatsAppProvider extends WhatsAppProvider {
  private readonly logger = new Logger(CloudWhatsAppProvider.name);
  private readonly phoneNumberId: string;
  private readonly apiToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super();
    this.phoneNumberId = this.configService.getOrThrow<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.apiToken = this.configService.getOrThrow<string>('WHATSAPP_API_TOKEN');
  }

  async sendMessage(message: WhatsAppMessage): Promise<{ externalId: string }> {
    const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            messaging_product: 'whatsapp',
            to: message.to,
            type: 'text',
            text: { body: message.body },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const externalId = response.data.messages[0].id;
      this.logger.log(`Message sent to ${message.to} (externalId: ${externalId})`);
      return { externalId };
    } catch (error: any) {
      const detail = error.response?.data ?? error.message;
      this.logger.error(`Failed to send message to ${message.to}: ${JSON.stringify(detail)}`);
      throw error;
    }
  }
}

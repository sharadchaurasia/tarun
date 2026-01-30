import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppMessage {
  to: string;
  body: string;
}

export interface WhatsAppProvider {
  sendMessage(message: WhatsAppMessage): Promise<{ externalId: string }>;
}

@Injectable()
export class MockWhatsAppProvider implements WhatsAppProvider {
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  async sendMessage(message: WhatsAppMessage): Promise<{ externalId: string }> {
    const externalId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.logger.log(`[MOCK] Sending WhatsApp message to ${message.to}: "${message.body}" (externalId: ${externalId})`);
    return { externalId };
  }
}

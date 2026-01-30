import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { WhatsAppService } from './whatsapp.service.js';
import { WhatsAppController } from './whatsapp.controller.js';
import { MockWhatsAppProvider, CloudWhatsAppProvider } from './whatsapp.provider.js';
import { ContactsModule } from '../contacts/contacts.module.js';
import { MessagesModule } from '../messages/messages.module.js';
import { AssignmentModule } from '../assignment/assignment.module.js';

const logger = new Logger('WhatsAppModule');

@Module({
  imports: [ContactsModule, MessagesModule, AssignmentModule, HttpModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    {
      provide: 'WHATSAPP_PROVIDER',
      useFactory: (configService: ConfigService, httpService: HttpService) => {
        const apiToken = configService.get<string>('WHATSAPP_API_TOKEN');
        if (apiToken) {
          logger.log('Cloud WhatsApp provider active');
          return new CloudWhatsAppProvider(configService, httpService);
        }
        logger.log('Mock WhatsApp provider active');
        return new MockWhatsAppProvider();
      },
      inject: [ConfigService, HttpService],
    },
  ],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

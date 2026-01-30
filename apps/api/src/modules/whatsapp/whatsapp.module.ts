import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service.js';
import { WhatsAppController } from './whatsapp.controller.js';
import { MockWhatsAppProvider } from './whatsapp.provider.js';
import { ContactsModule } from '../contacts/contacts.module.js';
import { MessagesModule } from '../messages/messages.module.js';
import { AssignmentModule } from '../assignment/assignment.module.js';

@Module({
  imports: [ContactsModule, MessagesModule, AssignmentModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, MockWhatsAppProvider],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

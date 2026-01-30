import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ContactsService } from '../contacts/contacts.service.js';
import { MessagesService } from '../messages/messages.service.js';
import { MessagesGateway } from '../messages/messages.gateway.js';
import { AssignmentService } from '../assignment/assignment.service.js';
import { MockWhatsAppProvider } from './whatsapp.provider.js';
import { MessageDirection, ConversationStatus } from '@prisma/client';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private prisma: PrismaService,
    private contactsService: ContactsService,
    private messagesService: MessagesService,
    private messagesGateway: MessagesGateway,
    private assignmentService: AssignmentService,
    private whatsappProvider: MockWhatsAppProvider,
  ) {}

  async handleInboundMessage(tenantId: string, payload: {
    from: string;
    name?: string;
    body: string;
    externalId?: string;
  }) {
    this.logger.log(`Inbound message from ${payload.from}: "${payload.body}"`);

    // 1. Find or create contact
    const contact = await this.contactsService.findOrCreateByPhone(
      tenantId,
      payload.from,
      payload.name,
    );

    // 2. Find or create conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        tenantId,
        contactId: contact.id,
        status: { not: ConversationStatus.RESOLVED },
      },
    });

    const isNewConversation = !conversation;
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          tenantId,
          contactId: contact.id,
          status: ConversationStatus.OPEN,
          leadStatus: 'NEW',
        },
      });
    }

    // 3. Create message
    const message = await this.messagesService.create({
      tenantId,
      conversationId: conversation.id,
      direction: MessageDirection.INBOUND,
      body: payload.body,
      externalId: payload.externalId,
    });

    // 4. Auto-assign if new conversation
    if (isNewConversation) {
      const agentId = await this.assignmentService.autoAssign(tenantId, conversation.id);
      if (agentId) {
        conversation = await this.prisma.conversation.findUniqueOrThrow({
          where: { id: conversation.id },
        });
      }
    }

    // 5. Emit WebSocket events
    this.messagesGateway.emitToTenant(tenantId, 'message:new', message);

    const updatedConvo = await this.prisma.conversation.findUniqueOrThrow({
      where: { id: conversation.id },
      include: {
        contact: { select: { id: true, name: true, phone: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { body: true, direction: true, createdAt: true },
        },
      },
    });
    this.messagesGateway.emitToTenant(tenantId, 'conversation:updated', updatedConvo);

    return { message, conversation: updatedConvo };
  }

  async sendOutbound(tenantId: string, conversationId: string, body: string, senderId: string) {
    const conversation = await this.prisma.conversation.findFirstOrThrow({
      where: { id: conversationId, tenantId },
      include: { contact: true },
    });

    // Send via WhatsApp provider
    const { externalId } = await this.whatsappProvider.sendMessage({
      to: conversation.contact.phone,
      body,
    });

    // Create message record
    const message = await this.messagesService.create({
      tenantId,
      conversationId,
      senderId,
      direction: MessageDirection.OUTBOUND,
      body,
      externalId,
    });

    // Emit
    this.messagesGateway.emitToTenant(tenantId, 'message:new', message);

    return message;
  }
}

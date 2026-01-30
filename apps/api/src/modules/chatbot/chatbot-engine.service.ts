import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

interface WorkflowTrigger {
  type: 'new_message' | 'keyword_match' | 'new_conversation';
  config: {
    keywords?: string[];
    matchMode?: 'any' | 'all';
  };
}

interface WorkflowAction {
  type: 'send_reply' | 'change_lead_status' | 'assign_agent' | 'add_note' | 'delay';
  config: {
    body?: string;
    status?: string;
    agentId?: string;
    content?: string;
    seconds?: number;
  };
}

@Injectable()
export class ChatbotEngineService {
  private readonly logger = new Logger(ChatbotEngineService.name);

  constructor(private prisma: PrismaService) {}

  async onNewMessage(
    tenantId: string,
    conversationId: string,
    messageBody: string,
    isFirstMessage: boolean,
  ) {
    const workflows = await this.prisma.chatbotWorkflow.findMany({
      where: { tenantId, isActive: true },
    });

    for (const workflow of workflows) {
      const trigger = workflow.trigger as unknown as WorkflowTrigger;
      const actions = workflow.actions as unknown as WorkflowAction[];

      if (!this.evaluateTrigger(trigger, messageBody, isFirstMessage)) {
        continue;
      }

      try {
        await this.executeActions(tenantId, conversationId, actions);
        await this.prisma.workflowLog.create({
          data: {
            workflowId: workflow.id,
            conversationId,
            status: 'success',
          },
        });
        this.logger.log(`Workflow "${workflow.name}" executed for conversation ${conversationId}`);
      } catch (error: any) {
        await this.prisma.workflowLog.create({
          data: {
            workflowId: workflow.id,
            conversationId,
            status: 'failed',
            error: error.message || 'Unknown error',
          },
        });
        this.logger.error(`Workflow "${workflow.name}" failed: ${error.message}`);
      }
    }
  }

  private evaluateTrigger(
    trigger: WorkflowTrigger,
    messageBody: string,
    isFirstMessage: boolean,
  ): boolean {
    switch (trigger.type) {
      case 'new_message':
        return true;

      case 'keyword_match': {
        const keywords = trigger.config.keywords || [];
        const mode = trigger.config.matchMode || 'any';
        const bodyLower = messageBody.toLowerCase();
        if (mode === 'all') {
          return keywords.every((kw) => bodyLower.includes(kw.toLowerCase()));
        }
        return keywords.some((kw) => bodyLower.includes(kw.toLowerCase()));
      }

      case 'new_conversation':
        return isFirstMessage;

      default:
        return false;
    }
  }

  private async executeActions(
    tenantId: string,
    conversationId: string,
    actions: WorkflowAction[],
  ) {
    for (const action of actions) {
      switch (action.type) {
        case 'send_reply': {
          if (action.config.body) {
            await this.prisma.message.create({
              data: {
                tenantId,
                conversationId,
                direction: 'OUTBOUND',
                body: action.config.body,
                status: 'SENT',
              },
            });
            await this.prisma.conversation.update({
              where: { id: conversationId },
              data: { lastMessageAt: new Date() },
            });
          }
          break;
        }

        case 'change_lead_status': {
          if (action.config.status) {
            await this.prisma.conversation.update({
              where: { id: conversationId },
              data: { leadStatus: action.config.status },
            });
          }
          break;
        }

        case 'assign_agent': {
          if (action.config.agentId) {
            await this.prisma.conversation.update({
              where: { id: conversationId },
              data: { assignedAgentId: action.config.agentId },
            });
          }
          break;
        }

        case 'add_note': {
          if (action.config.content) {
            await this.prisma.conversationNote.create({
              data: {
                tenantId,
                conversationId,
                userId: 'system',
                content: action.config.content,
              },
            });
          }
          break;
        }

        case 'delay': {
          const seconds = action.config.seconds || 1;
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
          break;
        }
      }
    }
  }
}

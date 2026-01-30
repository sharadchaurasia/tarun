import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TenantsModule } from './modules/tenants/tenants.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ContactsModule } from './modules/contacts/contacts.module.js';
import { ConversationsModule } from './modules/conversations/conversations.module.js';
import { MessagesModule } from './modules/messages/messages.module.js';
import { AssignmentModule } from './modules/assignment/assignment.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { LeadStatusModule } from './modules/lead-status/lead-status.module.js';
import { ChatbotModule } from './modules/chatbot/chatbot.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ContactsModule,
    ConversationsModule,
    MessagesModule,
    AssignmentModule,
    TeamsModule,
    WhatsAppModule,
    LeadsModule,
    LeadStatusModule,
    ChatbotModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
  ],
})
export class AppModule {}

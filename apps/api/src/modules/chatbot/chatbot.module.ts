import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service.js';
import { ChatbotEngineService } from './chatbot-engine.service.js';
import { ChatbotController } from './chatbot.controller.js';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatbotEngineService],
  exports: [ChatbotService, ChatbotEngineService],
})
export class ChatbotModule {}

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Module } from '@nestjs/common';

@Module({
  providers: [ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}

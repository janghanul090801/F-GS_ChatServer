import { Controller, Post, Body } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatGateway: ChatGateway) {}

  @Post('send')
  sendMessage(@Body() body: { to: string; from: string; message: string }) {
    const { to, from, message } = body;
    this.chatGateway.sendMessageToUser(to, from, message);
    return { status: 'ok' };
  }
}

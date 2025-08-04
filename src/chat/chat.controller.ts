import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMessages(
    @Query('to') to: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    return this.chatService.getMessages(to, pageNum, limitNum);
  }

  @Get('unread-count')
  async getUnreadCount(@Query('to') to: string) {
    return this.chatService.getUnreadCount(to);
  }

  @Post()
  async sendMessage(
    @Body() body: { from: string; to: string; content: string },
  ) {
    return this.chatService.saveMessage(body.from, body.to, body.content);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    await this.chatService.markMessagesAsRead([parseInt(id)]);
    return { message: `Message ${id} marked as read.` };
  }
}

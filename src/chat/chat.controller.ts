import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SendMessageDto } from './chat.entity';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':to')
  async getMessages(
    @Param('to') to: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 20,
  ) {
    console.log(to);
    return this.chatService.getMessages(String(to), page, limit);
  }

  @Get('unread-count')
  async getUnreadCount(@Query('to') to: string) {
    return this.chatService.getUnreadCount(to);
  }

  @Post()
  async sendMessage(@Req() req: RequestWithUser, @Body() body: SendMessageDto) {
    const from = req.user.userId;

    return this.chatService.saveMessage(String(from), body.to, body.content);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    await this.chatService.markMessagesAsRead([parseInt(id)]);
    return { message: `Message ${id} marked as read.` };
  }

  @Get('getList')
  async getChatList(@Req() req: RequestWithUser) {
    return this.chatService.getChatList(String(req.user.userId));
  }
}

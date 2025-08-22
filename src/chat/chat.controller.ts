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
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SendMessageDto } from './chat.entity';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
  query: {
    page?: string;
    limit?: string;
    [key: string]: string | undefined;
  };
}

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly chatService: ChatService) {}

  @Get('unread-count')
  async getUnreadCount(@Query('to') to: string) {
    return this.chatService.getUnreadCount(to);
  }

  @Post()
  async sendMessage(@Req() req: RequestWithUser, @Body() body: SendMessageDto) {
    const from = req.user.userId;
    return this.chatService.saveMessage(String(from), body.to, body.content);
  }

  @Get('list')
  async getChatList(@Req() req: RequestWithUser) {
    return this.chatService.getChatList(String(req.user.userId));
  }

  @Get('user/:to')
  @ApiParam({
    name: 'to',
    description: 'receiver userId',
    type: 'number',
  })
  async getMessages(
    @Req() req: RequestWithUser,
    @Param('to', ParseIntPipe) to: number,
  ) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10000;
    return this.chatService.getMessages(String(to), page, limit);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    await this.chatService.markMessagesAsRead([id]);
    return { message: `Message ${id} marked as read.` };
  }
}

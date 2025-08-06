import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessagesController } from './chat.controller';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';
import { Notification } from '../notification/notification.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Notification]),
    NotificationModule,
  ],
  providers: [ChatGateway, ChatService, NotificationService],
  controllers: [MessagesController],
})
export class ChatModule {}

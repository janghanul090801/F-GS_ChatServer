import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
  ) {}

  async saveMessage(
    from: string,
    to: string,
    message: string,
  ): Promise<ChatMessage> {
    const chat = this.chatRepo.create({ from, to, message });
    return this.chatRepo.save(chat);
  }

  async getMessageBetweenUsers(a: bigint, b: bigint): Promise<ChatMessage[]> {
    return this.chatRepo.find({
      where: [
        { to: a.toString(), from: b.toString() },
        { to: b.toString(), from: a.toString() },
      ],
      order: { createdAt: 'desc' },
    });
  }

  async getUnreadMessages(to: string): Promise<ChatMessage[]> {
    return this.chatRepo.find({
      where: { to, isRead: false },
      order: { createdAt: 'ASC' },
    });
  }

  async markMessagesAsRead(ids: number[]) {
    await this.chatRepo.update(ids, { isRead: true });
  }

  async getMessages(to: string, page: number, limit: number) {
    return this.chatRepo.find({
      where: { to },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getUnreadCount(to: string) {
    const count = await this.chatRepo.count({
      where: { to, isRead: false },
    });
    return { count };
  }
}

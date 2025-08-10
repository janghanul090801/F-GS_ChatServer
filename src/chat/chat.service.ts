import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ChatListItemDto, ChatMessage } from './chat.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async saveMessage(
    from: string,
    to: string,
    message: string,
  ): Promise<ChatMessage> {
    const chat = this.chatRepo.create({ from, to, message });
    return this.chatRepo.save(chat);
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

  async getChatList(userId: string): Promise<ChatListItemDto[]> {
    const rows: ChatListItemDto[] = await this.dataSource.query(
      `
      SELECT
        u.id AS "userId",
        u.name AS "userName",
        u.profile_image AS "profileImage",
        m.content AS "lastMessage",
        m.created_at AS "lastMessageAt",
        COALESCE(unread.count, 0) AS "unreadCount"
      FROM users u
      INNER JOIN (
        SELECT DISTINCT ON (
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
        )
        id,
        content,
        created_at,
        sender_id,
        receiver_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END,
          created_at DESC
      ) m ON (m.sender_id = u.id OR m.receiver_id = u.id)
      LEFT JOIN (
        SELECT sender_id, COUNT(*) AS count
        FROM messages
        WHERE receiver_id = $1 AND is_read = false
        GROUP BY sender_id
      ) unread ON unread.sender_id = u.id
      WHERE u.id != $1
      ORDER BY m.created_at DESC
    `,
      [userId],
    );

    return rows.map((row) => ({
      userId: row.userId,
      userName: row.userName,
      profilePath: row.profilePath,
      lastMessage: row.lastMessage,
      lastMessageAt: row.lastMessageAt,
      unreadCount: row.unreadCount,
    }));
  }
}

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
        u.profile_path AS "profileImage",
        m.message AS "lastMessage",
        m.created_at AS "lastMessageAt",
        COALESCE(unread.count, 0) AS "unreadCount"
      FROM users u
      INNER JOIN (
        SELECT DISTINCT ON (
          CASE WHEN "from" = $1 THEN "to" ELSE "from" END
        )
        id,
        message,
        created_at,
        "from",
        "to"
        FROM chat_message
        WHERE "from" = $1 OR "to" = $1
        ORDER BY
          CASE WHEN "from" = $1 THEN "to" ELSE "from" END,
          created_at DESC
      ) m ON (m."from" = u.id OR m."to" = u.id)
      LEFT JOIN (
        SELECT "from", COUNT(*) AS count
        FROM chat_message
        WHERE "to" = $1 AND is_read = false
        GROUP BY "from"
      ) unread ON unread."from" = u.id
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

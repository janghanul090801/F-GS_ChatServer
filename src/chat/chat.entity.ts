import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  from: string;

  @Column('bigint')
  to: string;

  @Column()
  message: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;
}

export class SendMessageDto {
  @ApiProperty({ example: '1', description: 'Receiver Id' })
  to: string;

  @ApiProperty({ example: 'Hello!', description: 'Message content' })
  content: string;
}

export class ChatListItemDto {
  userId: string;
  userName: string;
  profilePath: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

import { Injectable } from '@nestjs/common';
import { NotificationNest } from './notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationNest)
    private readonly notifiRepo: Repository<NotificationNest>,
  ) {}

  async saveNotification(
    receiverId: string,
    type: string,
    message: string,
    metadata: Map<string, any>,
  ): Promise<NotificationNest> {
    const notif = this.notifiRepo.create({
      receiverId,
      type,
      message,
      metadata,
    });
    return this.notifiRepo.save(notif);
  }

  async getNotifications(receiverId: string): Promise<NotificationNest[]> {
    return this.notifiRepo.find({
      where: {
        receiverId: receiverId,
      },
      order: { createdAt: 'desc' },
    });
  }
}

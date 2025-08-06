import { Injectable } from '@nestjs/common';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifiRepo: Repository<Notification>,
  ) {}

  async saveNotification(
    receiverId: string,
    type: string,
    message: string,
    metadata: Map<string, any>,
  ): Promise<Notification> {
    const notif = this.notifiRepo.create({
      receiverId,
      type,
      message,
      metadata,
    });
    return this.notifiRepo.save(notif);
  }

  async getNotifications(receiverId: string): Promise<Notification[]> {
    return this.notifiRepo.find({
      where: {
        receiverId: receiverId,
      },
      order: { createdAt: 'desc' },
    });
  }
}

import { Controller, Get, Param, Headers } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':id')
  async getNotifications(
    @Headers('InternalApiKey') apiKey: string,
    @Param('id') id: string,
  ) {
    if (apiKey != process.env.INTERNAL_API_KEY) {
      return { status: 'error', message: 'Wrong API Key' };
    }
    const notifications = await this.notificationService.getNotifications(id);

  }
}

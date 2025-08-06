import { Controller, Get, Param, Headers } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ConfigService } from '@nestjs/config';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  @Get(':id')
  async getNotifications(
    @Headers('InternalApiKey') apiKey: string,
    @Param('id') id: string,
  ) {
    if (apiKey != this.configService.get<string>('INTERNAL_API_KEY')) {
      return { status: 'error', message: 'Wrong API Key' };
    }
    const notifications = await this.notificationService.getNotifications(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return notifications.map((notification) => notification.toResponse());
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class DebugNotificationDto {
  @ApiProperty({ description: 'OneSignal player ID to send the notification' })
  playerId: string;

  @ApiProperty({
    description: 'Notification title',
    default: 'Test notification',
  })
  title?: string;

  @ApiProperty({ description: 'Notification subtitle', default: 'Debug' })
  subtitle?: string;

  @ApiProperty({
    description: 'Notification body',
    default: 'This is a test notification',
  })
  body?: string;

  @ApiProperty({
    description: 'Additional data for the notification (optional)',
    required: false,
  })
  data?: any;
}

import { ApiProperty } from '@nestjs/swagger';
import { Alert, Trigger } from '@prisma/client';

export class CreateAlertDto implements Alert {
  @ApiProperty({
    description: 'The title of the alert notification',
    example: 'Take Medication',
    required: true,
  })
  title: string;

  @ApiProperty({
    description: 'The subtitle of the alert notification',
    example: 'Daily Dosage Reminder',
    required: true,
  })
  subtitle: string;

  @ApiProperty({
    description: 'The main content body of the alert notification',
    example: 'Time to take your prescribed medication',
    required: true,
  })
  body: string;

  @ApiProperty({
    description: 'Configuration for when and how the alert should trigger',
    required: true,
  })
  trigger: Trigger;

  createdAt: Date;
  id: string;
  updatedAt: Date;
  userId: string;
}

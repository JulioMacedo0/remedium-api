import { ApiProperty } from '@nestjs/swagger';
import { Alert as PrismaAlert } from '@prisma/client';

export class Alert implements PrismaAlert {
  @ApiProperty({
    description: 'Unique identifier for the alert',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Alert title',
    example: 'Take Medication',
  })
  title: string;

  @ApiProperty({
    description: 'Alert subtitle',
    example: 'Daily dosage reminder',
  })
  subtitle: string;

  @ApiProperty({
    description: 'Alert body content',
    example: 'Time to take your ibuprofen medication',
  })
  body: string;

  @ApiProperty({
    description: 'When the alert was created',
    example: '2025-05-27T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the alert was last updated',
    example: '2025-05-27T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID of the user who owns this alert',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;
}

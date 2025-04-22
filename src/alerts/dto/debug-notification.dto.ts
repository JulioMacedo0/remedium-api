import { ApiProperty } from '@nestjs/swagger';

export class DebugNotificationDto {
  @ApiProperty({
    description:
      'ID do player OneSignal (expo_token) para enviar a notificação',
  })
  playerId: string;

  @ApiProperty({
    description: 'Título da notificação',
    default: 'Notificação de teste',
  })
  title?: string;

  @ApiProperty({ description: 'Subtítulo da notificação', default: 'Debug' })
  subtitle?: string;

  @ApiProperty({
    description: 'Corpo da notificação',
    default: 'Esta é uma notificação de teste',
  })
  body?: string;

  @ApiProperty({
    description: 'Dados adicionais para a notificação (opcional)',
    required: false,
  })
  data?: any;
}

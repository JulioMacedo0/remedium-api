import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthEntity {
  @ApiProperty({ description: 'Short-lived access token' })
  accessToken: string;

  @ApiProperty({ description: 'Long-lived refresh token' })
  refreshToken: string;

  @ApiProperty()
  user: User;
}

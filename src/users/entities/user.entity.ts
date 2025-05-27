// src/users/entities/user.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserEntity implements User {
  @ApiProperty({ description: 'User preferred language tag (e.g., en-US)' })
  languageTag: string;

  @ApiProperty({ description: 'User timezone (e.g., America/New_York)' })
  timeZone: string;

  @ApiProperty({ description: 'Username for login and display' })
  username: string;

  @ApiProperty({
    description: 'Unique user identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'When the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the user was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: "User's full name" })
  name: string;

  @ApiProperty({
    description: "User's email address",
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Expo push notification token' })
  expo_token: string;

  password: string;
}

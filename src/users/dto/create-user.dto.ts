// src/users/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @ApiProperty({
    description: "User's username for authentication and display",
    example: 'johnsmith',
  })
  username: string;

  @IsString()
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsEmail()
  @ApiProperty({
    description: "User's email address for authentication and notifications",
    example: 'user@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6)
  @ApiProperty({
    description: "User's password (min length: 6 characters)",
    example: 'password123',
    minLength: 6,
  })
  password: string;

  @IsNotEmpty({ message: 'languageTag is required' })
  @ApiProperty({
    description: "User's preferred language tag (BCP 47 language tag)",
    example: 'en-US',
    default: 'en-US',
  })
  languageTag: string;

  @IsNotEmpty({ message: 'timeZone is required' })
  @ApiProperty({
    description: "User's timezone (IANA timezone format)",
    example: 'America/New_York',
    default: 'UTC',
  })
  timeZone: string;

  @ApiProperty({
    description: 'Expo push notification token for mobile device',
    required: false,
  })
  expo_token: string;
}

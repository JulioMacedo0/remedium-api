// src/users/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6)
  @ApiProperty()
  password: string;

  expo_token: string;
}

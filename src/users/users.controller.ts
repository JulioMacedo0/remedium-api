// src/users/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetJwtPayload } from 'src/auth/jwt.decorator';
import { JwtEnity } from 'src/auth/entity/jwt.entity';

@Controller('api/v1/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user account',
    description: 'Creates a new user with the provided details',
  })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserEntity,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all registered users',
  })
  @ApiOkResponse({
    description: 'Users successfully retrieved',
    type: UserEntity,
    isArray: true,
  })
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('one')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user',
    description:
      "Retrieves the currently logged in user's profile based on JWT token",
  })
  @ApiOkResponse({
    description: 'User profile successfully retrieved',
    type: UserEntity,
  })
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  findOne(@GetJwtPayload() jwt: JwtEnity) {
    return this.usersService.findOne(jwt.id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update current user',
    description: "Updates the currently logged in user's profile data",
  })
  @ApiOkResponse({ description: 'User successfully updated', type: UserEntity })
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  update(@GetJwtPayload() jwt: JwtEnity, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(jwt.id, updateUserDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete current user',
    description: "Permanently deletes the currently logged in user's account",
  })
  @ApiOkResponse({ description: 'User successfully deleted', type: UserEntity })
  @ApiBearerAuth('JWT-auth')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token missing or invalid',
  })
  remove(@GetJwtPayload() jwt: JwtEnity) {
    return this.usersService.remove(jwt.id);
  }
}

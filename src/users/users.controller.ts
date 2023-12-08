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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetJwtPayload } from 'src/auth/jwt.decorator';
import { JwtEnity } from 'src/auth/entity/jwt.entity';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('one')
  @ApiOkResponse({ type: UserEntity })
  @UseGuards(JwtAuthGuard)
  findOne(@GetJwtPayload() jwt: JwtEnity) {
    return this.usersService.findOne(jwt.id);
  }

  @Patch()
  @ApiCreatedResponse({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserEntity })
  @UseGuards(JwtAuthGuard)
  update(@GetJwtPayload() jwt: JwtEnity, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(jwt.id, updateUserDto);
  }

  @Delete()
  @ApiOkResponse({ type: UserEntity })
  @UseGuards(JwtAuthGuard)
  remove(@GetJwtPayload() jwt: JwtEnity) {
    return this.usersService.remove(jwt.id);
  }
}

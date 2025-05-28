// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { encoderPassword } from 'src/utils/bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const encriptPassword = await encoderPassword(createUserDto.password);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: encriptPassword },
    });
    delete user.password;
    return user;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        medicines: true,
        alerts: true,
        expo_token: true,
        createdAt: true,
        updatedAt: true,
        languageTag: true,
        timeZone: true,
      },
    });

    return users;
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
    delete user.password;

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
      },
    });
    delete user.password;
    return user;
  }

  async remove(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.delete({ where: { id } });
    delete user.password;
    return user;
  }
}

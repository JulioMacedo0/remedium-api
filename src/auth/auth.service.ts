import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthEntity } from './entity/auth.entity';
import { comparePassword } from 'src/utils/bcrypt';
import { Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    res: Response,
    email: string,
    password: string,
  ): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new NotFoundException('Invalid Credentials');
    }

    if (!comparePassword(password, user.password)) {
      throw new NotFoundException('Invalid Credentials');
    }
    delete user.password;

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      {
        id: user.id,
        tokenType: 'refresh',
      },
      { expiresIn: '30d' },
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refresh(refreshToken: string, res: Response): Promise<AuthEntity> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      delete user.password;

      const newAccessToken = this.jwtService.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        { expiresIn: '15m' },
      );

      const newRefreshToken = this.jwtService.sign(
        {
          id: user.id,
          tokenType: 'refresh',
        },
        { expiresIn: '30d' },
      );

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}

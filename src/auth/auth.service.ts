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
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    if (!comparePassword(password, user.password)) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    delete user.password;

    const acessToken = this.jwtService.sign({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    res.cookie('user_token', acessToken);
    return {
      accessToken: acessToken,
      user,
    };
  }
}

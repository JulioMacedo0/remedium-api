import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthEntity } from './entity/auth.entity';
import { comparePassword } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new NotFoundException(`User dont exist`);
    }

    if (!comparePassword(password, user.password)) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    delete user.password;
    return {
      accessToken: this.jwtService.sign({
        id: user.id,
        username: user.username,
        email: user.email,
      }),
      user,
    };
  }
}

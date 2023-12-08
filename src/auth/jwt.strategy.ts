//src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from './auth.module';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { JwtEnity } from './entity/jwt.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.stractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtEnity) {
    return payload;
  }

  private static stractJWT(re: Request): string | null {
    if (
      re.cookies &&
      'user_token' in re.cookies &&
      re.cookies.user_token.length > 0
    ) {
      return re.cookies.user_token;
    }

    return null;
  }
}

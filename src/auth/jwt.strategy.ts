//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { JwtEnity, TokenType } from './entity/jwt.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWTSECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtEnity) {
    if (payload.tokenType === 'refresh') {
      throw new UnauthorizedException('Invalid token for this operation');
    }

    return payload;
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'accessToken' in req.cookies &&
      req.cookies.accessToken.length > 0
    ) {
      return req.cookies.accessToken;
    }

    return null;
  }
}

import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEntity } from './entity/auth.entity';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { signInValidationSchema } from 'src/shared/validation-schema/auth';
import { SignInRequest } from 'src/shared/types/auth/sign-in-dto';

@Controller('api/v1/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  @UsePipes(new ZodValidationPipe(signInValidationSchema))
  @ApiOkResponse({ type: AuthEntity })
  @ApiOperation({ summary: 'Sign in and get access and refresh tokens' })
  login(
    @Body() { email, password }: SignInRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(response, email, password);
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthEntity })
  @ApiOperation({ summary: 'Get new tokens using refresh token' })
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      return { error: 'Refresh token not found' };
    }

    return this.authService.refresh(refreshToken, response);
  }
}

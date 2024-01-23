import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEntity } from './entity/auth.entity';
// import { LoginDto } from './dto/login.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
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
  login(
    @Body() { email, password }: SignInRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(response, email, password);
  }
}

import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
) {
  @ApiProperty()
  email?: string;
  @ApiProperty()
  username?: string;

  expo_token: string;
}

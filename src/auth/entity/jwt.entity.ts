import { ApiProperty } from '@nestjs/swagger';

export type TokenType = 'refresh' | 'access';

export class JwtEnity {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username of the authenticated user',
    example: 'johnsmith',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'Email of the authenticated user',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Type of token (access or refresh)',
    enum: ['access', 'refresh'],
    example: 'access',
    required: false,
  })
  tokenType?: TokenType;

  @ApiProperty({
    description: 'Issued at timestamp',
    example: 1653395706,
  })
  iat: number;

  @ApiProperty({
    description: 'Expiration timestamp',
    example: 1653396606,
  })
  exp: number;
}

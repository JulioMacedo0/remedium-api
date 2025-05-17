export type TokenType = 'refresh' | 'access';

export class JwtEnity {
  id: string;
  username?: string;
  email?: string;
  tokenType?: TokenType;
  iat: number;
  exp: number;
}

export class JwtEnity {
  id: string;
  username?: string;
  email?: string;
  tokenType?: string; // 'refresh' for refresh tokens, undefined for access tokens
  iat: number;
  exp: number;
}

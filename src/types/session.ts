export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresAt: number; // Access Token 만료 시간 (timestamp)
}

export interface AuthResult {
  userId: string | null;
  error: string | null;
  setCookie?: string[]; // 토큰 갱신 시 설정할 쿠키
}

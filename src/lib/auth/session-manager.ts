import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import redis from '@/lib/redis';
import { SessionTokens } from '@/types/session';

const SECRET_KEY = process.env.NEXTAUTH_SECRET!;
const ACCESS_TOKEN_EXPIRY = '1h'; // 1시간
const REFRESH_TOKEN_EXPIRY_SEC = 60 * 60 * 24 * 14; // 14일 (초 단위)

// 로그인시 세션 생성
export async function createSession(userId: string): Promise<SessionTokens> {
  // Access Token 생성 (JWT)
  const accessToken = jwt.sign({ userId }, SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  // Refresh Token 생성 (랜덤 문자열)
  const refreshToken = randomBytes(32).toString('hex');

  const expiresAt = Date.now() + 60 * 60 * 1000; // 1시간 뒤

  // Redis에 저장
  await Promise.all([
    // Access Token → userId (1시간)
    // redis.set(`access:${accessToken}`, userId, 'EX', 3600),

    // Refresh Token → userId (14일)
    redis.set(`refresh:${refreshToken}`, userId, 'EX', REFRESH_TOKEN_EXPIRY_SEC),

    // userId → Refresh Token Set (다중 클라이언트 지원)
    redis.sadd(`user:${userId}:sessions`, refreshToken),
  ]);

  // Refresh Token에도 만료 시간 설정 (14일 후 자동 삭제)
  await redis.expire(`user:${userId}:sessions`, REFRESH_TOKEN_EXPIRY_SEC);

  return {
    accessToken,
    refreshToken,
    userId,
    expiresAt,
  };
}

// 엑세스 토큰 검증
export async function verifyAccessToken(token: string): Promise<{ userId: string } | null> {
  try {
    // JWT 검증
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };

    // Redis에서 확인 (이미 로그아웃되었는지 체크)
    // const userId = await redis.get(`access:${token}`);

    // if (!userId || userId !== decoded.userId) {
    //   return null;
    // }

    return { userId: decoded.userId };
  } catch (error) {
    // JWT 만료 또는 검증 실패
    return null;
  }
}

// 리프레시 토큰 검증
export async function refreshSession(oldRefreshToken: string): Promise<SessionTokens> {
  // Redis에서 Refresh Token 조회
  const userId = await redis.get(`refresh:${oldRefreshToken}`);

  if (!userId) {
    // 토큰이 없거나 만료됨
    // 재사용 감지를 위해 블랙리스트 확인
    const blacklisted = await redis.get(`blacklist:${oldRefreshToken}`);

    if (blacklisted) {
      // 탈취 시도 감지! 해당 사용자의 모든 세션 삭제
      console.error(`[Security] Refresh token reuse detected for user: ${blacklisted}`);
      await deleteAllUserSessions(blacklisted);
      throw new Error('Token reuse detected');
    }

    throw new Error('Invalid or expired refresh token');
  }

  // 사용된 Refresh Token을 블랙리스트에 등록 (24시간)
  await redis.set(`blacklist:${oldRefreshToken}`, userId, 'EX', 86400);

  // 기존 Refresh Token 삭제
  await redis.del(`refresh:${oldRefreshToken}`);

  // userId 세션 Set에서도 제거
  await redis.srem(`user:${userId}:sessions`, oldRefreshToken);

  // 새 토큰 쌍 발급
  return createSession(userId);
}

// 로그아웃
export async function deleteSession(refreshToken: string): Promise<void> {
  const userId = await redis.get(`refresh:${refreshToken}`);

  if (!userId) {
    return;
  }

  // Refresh Token 삭제
  await redis.del(`refresh:${refreshToken}`);

  // userId 세션 Set에서 제거
  await redis.srem(`user:${userId}:sessions`, refreshToken);

  // Access Token은 자연스럽게 만료됨 (1시간)
}

/**
 * 5. 한 사용자의 모든 세션 삭제 (강제 로그아웃)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  // 사용자의 모든 Refresh Token 가져오기
  const refreshTokens = await redis.smembers(`user:${userId}:sessions`);

  if (refreshTokens.length === 0) {
    return;
  }

  // 모든 Refresh Token 삭제
  const deletePromises = refreshTokens.map((token) => redis.del(`refresh:${token}`));

  await Promise.all(deletePromises);

  // 세션 Set 삭제
  await redis.del(`user:${userId}:sessions`);
}

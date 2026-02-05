import { test as setup, expect } from '@playwright/test';
import { encode } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '13YFlXIgc2g/QLtqQqpaIAge0Uw6RUEnM/2KR2iES6s';

/**
 * Seed 사용자(Alice)로 로그인된 세션 쿠키를 생성하는 글로벌 셋업.
 * NextAuth JWT를 직접 encode하여 session-token 쿠키로 주입한다.
 */
setup('authenticate as Alice', async ({ page, context }) => {
  const token = await encode({
    token: {
      sub: '00000000-0000-0000-0000-000000000001',
      name: 'Alice',
      email: 'alice@example.com',
      displayName: 'alice',
      picture: 'https://example.com/avatar/alice.png',
    },
    secret: NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 12,
  });

  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  // 세션이 유효한지 검증
  await page.goto('/');
  await expect(page.getByText('프로젝트로 이동')).toBeVisible({ timeout: 10_000 });

  await context.storageState({ path: './e2e/.auth/user.json' });
});

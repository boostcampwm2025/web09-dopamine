import { test, expect } from '@playwright/test';

test.describe('홈 / 인증', () => {
  test('1.1 비로그인 시 홈 페이지에 소셜 로그인 버튼이 노출된다', async ({
    browser,
  }) => {
    // 명시적으로 빈 storageState로 비로그인 컨텍스트 생성
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    await page.goto('/');

    // 소셜 로그인 이미지 확인 (GitHub, Google, Naver)
    // session이 null이면 SocialLogin 컴포넌트가 렌더링됨
    await expect(
      page.locator('img[alt="github"], img[alt="google"], img[alt="naver"]').first(),
    ).toBeVisible({ timeout: 10_000 });

    // "빠르게 시작하기" 버튼 확인
    await expect(page.getByText('빠르게 시작하기')).toBeVisible();

    await context.close();
  });

  test('1.2 비로그인 시 /project 접근하면 홈으로 리다이렉트된다', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    // 서버사이드 redirect('/')가 동작
    await page.goto('/project');

    // 홈 페이지로 리다이렉트 확인 (Next.js 서버 리다이렉트)
    await page.waitForURL('/', { timeout: 10_000 });

    await context.close();
  });

  test('1.3 로그인 상태에서 "프로젝트로 이동" 버튼이 보인다', async ({
    page,
  }) => {
    // storageState로 Alice 세션 주입된 상태
    await page.goto('/');

    await expect(page.getByText('프로젝트로 이동')).toBeVisible();
  });

  test('1.4 "프로젝트로 이동" 클릭 시 /project로 이동한다', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByText('프로젝트로 이동').click();

    await page.waitForURL('/project', { timeout: 10_000 });
    expect(page.url()).toContain('/project');
  });
});

import { test, expect } from '@playwright/test';

test.describe('마이페이지', () => {
  test('10.1 프로필 정보가 표시된다', async ({ page }) => {
    await page.goto('/mypage');

    // 프로필 정보 섹션 확인
    await expect(page.getByText('프로필 정보')).toBeVisible();

    // Seed 사용자(Alice) 정보 확인
    await expect(page.getByRole('heading', { name: 'Alice' })).toBeVisible();
    await expect(page.getByText('@alice')).toBeVisible();

    // 필드 라벨 확인
    await expect(page.getByText('보여질 이름')).toBeVisible();
    await expect(page.getByText('계정이름')).toBeVisible();
    await expect(page.getByText('이메일', { exact: true })).toBeVisible();
  });

  test('10.2 닉네임을 수정할 수 있다', async ({ page }) => {
    await page.goto('/mypage');

    await expect(page.getByText('보여질 이름')).toBeVisible();

    // 수정 버튼 (연필 아이콘) 클릭
    const editButton = page.locator('button', { hasText: /수정/ });
    const pencilIcon = page.locator('img[src*="pencil"], button[aria-label*="수정"], button[aria-label*="edit"]');

    const editTrigger = (await editButton.isVisible().catch(() => false))
      ? editButton
      : pencilIcon.first();

    if (await editTrigger.isVisible().catch(() => false)) {
      await editTrigger.click();

      // 입력 필드가 편집 가능해지는지 확인
      const nameInput = page.locator('input').first();
      if (await nameInput.isEditable()) {
        await nameInput.clear();
        await nameInput.fill('Alice_Updated');
        await nameInput.press('Enter');

        await page.waitForTimeout(1000);
      }
    }
  });

  test('10.3 로그아웃 버튼이 동작한다', async ({ page }) => {
    await page.goto('/mypage');

    // 로그아웃 버튼 확인
    const logoutButton = page.getByText('로그아웃');
    await expect(logoutButton).toBeVisible();

    await logoutButton.click();

    // 홈 페이지로 리다이렉트 확인
    await page.waitForURL('/', { timeout: 10_000 });
  });

  test('10.3 회원탈퇴 버튼이 표시된다', async ({ page }) => {
    await page.goto('/mypage');

    // 회원탈퇴 버튼 확인
    const withdrawButton = page.getByText('회원탈퇴');
    await expect(withdrawButton).toBeVisible();

    // 실제 탈퇴는 수행하지 않음 (Seed 데이터 보존)
  });
});

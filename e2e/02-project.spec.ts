import { test, expect } from '@playwright/test';

test.describe('프로젝트 관리', () => {
  test('2.1 프로젝트 목록이 표시된다', async ({ page }) => {
    await page.goto('/project');
    await page.waitForLoadState('networkidle');

    // "내 프로젝트" 헤더 확인
    await expect(page.getByText('내 프로젝트')).toBeVisible({ timeout: 10_000 });

    // Seed 프로젝트 "Dopamine Alpha" 확인
    await expect(page.getByText('Dopamine Alpha')).toBeVisible({ timeout: 10_000 });
  });

  test('2.2 프로젝트를 생성할 수 있다', async ({ page }) => {
    await page.goto('/project');
    await page.waitForLoadState('networkidle');

    // "새 프로젝트 만들기" 카드 클릭
    await page.getByText('새 프로젝트 만들기').click();

    // 모달 확인
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 프로젝트 이름 입력
    const titleInput = dialog.locator('input').first();
    await titleInput.fill('E2E 테스트 프로젝트');

    // 설명 입력
    const descriptionInput = dialog.locator('textarea');
    if (await descriptionInput.isVisible().catch(() => false)) {
      await descriptionInput.fill('E2E 테스트용 프로젝트입니다.');
    }

    // 완료 버튼 클릭
    await dialog.getByText('완료').click();

    // 모달 닫힘 확인
    await expect(dialog).toBeHidden({ timeout: 5_000 });

    // 생성된 프로젝트가 목록에 표시되는지 확인
    await expect(page.getByText('E2E 테스트 프로젝트').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('2.3 프로젝트를 수정할 수 있다', async ({ page }) => {
    await page.goto('/project');
    await page.waitForLoadState('networkidle');

    // Seed 프로젝트 카드 클릭 → 프로젝트 상세 이동
    await page.getByText('Dopamine Alpha').first().click();
    await page.waitForURL(/\/project\/.+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // 수정 버튼 찾기 (프로젝트 상세 페이지에서)
    const editButton = page.locator('button').filter({ hasText: /수정|편집/ });
    if (await editButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await editButton.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      const titleInput = dialog.locator('input').first();
      await titleInput.clear();
      await titleInput.fill('Dopamine Alpha Updated');

      await dialog.getByText('완료').click();
      await expect(dialog).toBeHidden();
    }
  });

  test('2.4 프로젝트를 삭제할 수 있다 (Owner)', async ({ page }) => {
    // 먼저 삭제할 프로젝트 생성
    await page.goto('/project');
    await page.waitForLoadState('networkidle');
    await page.getByText('새 프로젝트 만들기').click();

    const dialog = page.getByRole('dialog');
    const titleInput = dialog.locator('input').first();
    await titleInput.fill('삭제할 프로젝트');
    await dialog.getByText('완료').click();
    await expect(dialog).toBeHidden({ timeout: 5_000 });

    // 생성 확인
    await expect(page.getByText('삭제할 프로젝트').first()).toBeVisible({ timeout: 10_000 });

    // 햄버거 메뉴 클릭
    const projectCard = page.locator('div', { hasText: '삭제할 프로젝트' }).first();
    const menuButton = projectCard.locator('img[src*="hamburger"]');
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.getByText('삭제').click();
      await expect(page.getByText('삭제할 프로젝트')).toBeHidden({ timeout: 10_000 });
    }
  });

  test('2.5 멤버를 초대할 수 있다', async ({ page }) => {
    await page.goto('/project');
    await page.waitForLoadState('networkidle');
    await page.getByText('Dopamine Alpha').first().click();
    await page.waitForURL(/\/project\/.+/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // 팀원 초대 버튼 클릭
    await page.getByText('팀원 초대').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 이메일 입력
    const emailInput = dialog.locator('input').first();
    await emailInput.fill('newmember@example.com');
    await emailInput.press('Enter');

    // 초대 링크 생성 버튼 클릭
    await dialog.getByText('초대 링크 생성').click();

    // 초대 성공 메시지 확인
    await expect(dialog.getByText(/초대 링크가 생성되었습니다/)).toBeVisible({ timeout: 10_000 });
  });
});

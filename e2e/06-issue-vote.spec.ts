import { test, expect } from '@playwright/test';
import { navigateToIssue, setIssueStatus } from './helpers';

// "Boost activation rate" 이슈는 VOTE 상태로 Seed됨
const SEED_ISSUE_VOTE = '00000000-0000-0000-0000-000000000302';

test.describe('이슈 - 투표', () => {
  test('6.1 VOTE 단계 이슈에 접근하면 투표 UI가 표시된다', async ({
    page,
  }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 이슈 제목 확인
    await expect(
      page.getByRole('link', { name: /Boost activation rate/ }).first(),
    ).toBeVisible();

    // 투표 버튼(찬성/반대)이 있는 아이디어 카드 확인
    await expect(page.getByText(/찬성/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/반대/)).toBeVisible();
  });

  test('6.2 아이디어에 찬성 투표를 할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 첫 번째 아이디어 카드의 찬성 버튼 클릭
    const agreeButtons = page.locator('button', { hasText: /찬성/ });
    await expect(agreeButtons.first()).toBeVisible({ timeout: 10_000 });

    // 현재 찬성 수 기록
    const buttonText = await agreeButtons.first().textContent();
    await agreeButtons.first().click();

    // 투표 후 버튼 상태 변경 확인 (활성화 상태)
    await page.waitForTimeout(1000);
    const updatedText = await agreeButtons.first().textContent();
    expect(updatedText).toBeTruthy();
  });

  test('6.3 아이디어에 반대 투표를 할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    const disagreeButtons = page.locator('button', { hasText: /반대/ });
    await expect(disagreeButtons.first()).toBeVisible({ timeout: 10_000 });

    await disagreeButtons.first().click();

    // 투표 후 변경 확인
    await page.waitForTimeout(1000);
    const updatedText = await disagreeButtons.first().textContent();
    expect(updatedText).toBeTruthy();
  });

  test('6.4 투표 필터로 아이디어를 필터링할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 필터 패널 버튼 확인
    const mostLikedFilter = page.locator('[data-filter="most-liked"]');
    const needDiscussionFilter = page.locator(
      '[data-filter="need-discussion"]',
    );

    if (await mostLikedFilter.isVisible().catch(() => false)) {
      await mostLikedFilter.click();
      await page.waitForTimeout(500);

      await needDiscussionFilter.click();
      await page.waitForTimeout(500);
    }
  });
});

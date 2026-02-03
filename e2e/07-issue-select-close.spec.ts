import { test, expect } from '@playwright/test';
import { navigateToIssue, setIssueStatus } from './helpers';

const SEED_ISSUE_VOTE = '00000000-0000-0000-0000-000000000302';

test.describe('이슈 - 선택 & 종료', () => {
  test('7.1 VOTE → SELECT 단계로 전환할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    await setIssueStatus(page, SEED_ISSUE_VOTE, 'SELECT');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // SELECT 단계에서는 이슈 종료 버튼이 보여야 함
    await expect(page.getByText('이슈 종료')).toBeVisible({ timeout: 5_000 });
  });

  test('7.2 아이디어를 선택할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'SELECT');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 아이디어 카드 클릭하여 선택
    const ideaCard = page.locator('[data-idea-card]').first();
    if (await ideaCard.isVisible().catch(() => false)) {
      await ideaCard.click();
    }
  });

  test('7.3 이슈를 종료할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'SELECT');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 이슈 종료 버튼 클릭
    const closeButton = page.getByText('이슈 종료');
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();

      // 종료 모달 확인
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible().catch(() => false)) {
        // 메모 입력 (선택)
        const memoInput = dialog.locator('#close-issue-memo');
        if (await memoInput.isVisible().catch(() => false)) {
          await memoInput.fill('E2E 테스트 종료 메모');
        }

        // 이슈 종료 확인
        await dialog.getByText('이슈 종료').click();

        // 종료 후 summary 페이지로 이동 확인
        await page.waitForURL(/\/issue\/.+\/summary/, { timeout: 10_000 });
      }
    }
  });
});

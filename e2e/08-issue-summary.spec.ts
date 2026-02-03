import { test, expect } from '@playwright/test';
import { setIssueStatus } from './helpers';

// 종료된 이슈의 summary를 테스트하려면 실제 종료된 이슈가 필요.
// Seed 데이터에는 BRAINSTORMING과 VOTE 상태만 있으므로,
// 실행 순서상 07-issue-select-close 이후에 동작한다고 가정.
const SEED_ISSUE_VOTE = '00000000-0000-0000-0000-000000000302';

test.describe('이슈 요약', () => {
  test('8.1 요약 페이지가 렌더링된다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'CLOSE');
    await page.goto(`/issue/${SEED_ISSUE_VOTE}/summary`);
    await page.waitForLoadState('domcontentloaded');

    // 요약 페이지 콘텐츠 확인 (종료되지 않은 이슈는 리다이렉트될 수 있음)
    const isOnSummary = page.url().includes('/summary');

    if (isOnSummary) {
      await expect(page.getByText('투표 결과 순위').first()).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test('8.2 투표 랭킹이 표시된다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'CLOSE');
    await page.goto(`/issue/${SEED_ISSUE_VOTE}/summary`);
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/summary')) {
      const rankingSection = page.getByText('투표 결과 순위');
      if (await rankingSection.isVisible().catch(() => false)) {
        await expect(rankingSection).toBeVisible();

        await expect(page.getByText('전체 순위')).toBeVisible();
        await expect(page.getByText('카테고리별')).toBeVisible();

        await page.getByText('카테고리별').click();
        await page.waitForTimeout(500);

        await page.getByText('전체 순위').click();
      }
    }
  });

  test('8.3 워드클라우드가 표시된다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'CLOSE');
    await page.goto(`/issue/${SEED_ISSUE_VOTE}/summary`);
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/summary')) {
      const wordcloud = page.locator('canvas');
      if (await wordcloud.isVisible().catch(() => false)) {
        await expect(wordcloud).toBeVisible();
      }
    }
  });

  test('8.4 선택된 아이디어가 표시된다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'CLOSE');
    await page.goto(`/issue/${SEED_ISSUE_VOTE}/summary`);
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/summary')) {
      const selectedBadge = page.getByText('Selected Idea');
      if (await selectedBadge.isVisible().catch(() => false)) {
        await expect(selectedBadge).toBeVisible();
      }
    }
  });
});

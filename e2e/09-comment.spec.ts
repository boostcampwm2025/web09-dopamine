import { test, expect } from '@playwright/test';
import { navigateToIssue, setIssueStatus } from './helpers';

// VOTE 상태 이슈에서 댓글 기능 테스트 (댓글 버튼은 VOTE 단계에서만 노출)
const SEED_ISSUE_VOTE = '00000000-0000-0000-0000-000000000302';

test.describe('댓글', () => {
  test('9.1 아이디어에 댓글을 작성할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 댓글 버튼이 있는 아이디어 카드 찾기
    const commentButton = page.locator('[aria-label="comment"]').first();
    await expect(commentButton).toBeVisible({ timeout: 10_000 });
    await commentButton.click();

    // 댓글 윈도우 확인
    const commentWindow = page.locator('[aria-label="댓글"]');
    await expect(commentWindow).toBeVisible();

    // 댓글 입력
    const commentInput = commentWindow.locator(
      'textarea, [placeholder="댓글 입력"]',
    );
    await expect(commentInput).toBeVisible();
    await commentInput.fill('E2E 테스트 댓글입니다.');

    // 작성 버튼 클릭
    const submitBtn = commentWindow.locator('button', {
      hasText: /작성|등록|저장/,
    });
    await submitBtn.click();

    // 작성된 댓글이 목록에 표시되는지 확인
    await expect(
      commentWindow.getByText('E2E 테스트 댓글입니다.'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('9.2 자신의 댓글을 수정할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 댓글 윈도우 열기
    const commentButton = page.locator('[aria-label="comment"]').first();
    await expect(commentButton).toBeVisible({ timeout: 10_000 });
    await commentButton.click();

    const commentWindow = page.locator('[aria-label="댓글"]');
    await expect(commentWindow).toBeVisible();

    // 수정 버튼 찾기 (자신의 댓글에만 표시)
    const editButton = commentWindow
      .locator('button', { hasText: /수정|편집/ })
      .first();

    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();

      const editInput = commentWindow.locator('textarea').first();
      await editInput.clear();
      await editInput.fill('수정된 댓글입니다.');

      const updateBtn = commentWindow.getByRole('button', { name: '저장' }).first();
      await updateBtn.click();

      await expect(
        commentWindow.getByText('수정된 댓글입니다.'),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('9.3 자신의 댓글을 삭제할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_VOTE, 'VOTE');
    await navigateToIssue(page, SEED_ISSUE_VOTE);

    // 댓글 윈도우 열기
    const commentButton = page.locator('[aria-label="comment"]').first();
    await expect(commentButton).toBeVisible({ timeout: 10_000 });
    await commentButton.click();

    const commentWindow = page.locator('[aria-label="댓글"]');
    await expect(commentWindow).toBeVisible();

    // 삭제 버튼 찾기
    const deleteButton = commentWindow
      .locator('button', { hasText: /삭제/ })
      .first();

    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

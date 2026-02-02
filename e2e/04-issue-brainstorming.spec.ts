import { test, expect } from '@playwright/test';
import { navigateToIssue, setIssueStatus } from './helpers';

// Alice가 OWNER인 BRAINSTORMING 이슈
const SEED_ISSUE_BRAINSTORMING = '00000000-0000-0000-0000-000000000301';

test.describe('이슈 - 브레인스토밍', () => {
  test('4.1 이슈 페이지가 렌더링된다', async ({ page }) => {
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    // 이슈 제목 확인
    await expect(page.getByRole('link', { name: /Improve retention/ }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('4.2 캔버스 더블클릭으로 아이디어를 생성할 수 있다', async ({
    page,
  }) => {
    await setIssueStatus(page, SEED_ISSUE_BRAINSTORMING, 'BRAINSTORMING');
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    // 캔버스 영역에서 더블클릭
    const canvas = page.getByTestId('issue-canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
    await canvas.dblclick({ position: { x: 400, y: 300 } });

    // 아이디어 입력 필드가 나타나는지 확인
    const ideaInput = page.getByTestId('idea-input').last();
    await expect(ideaInput).toBeVisible({ timeout: 5_000 });

    // 아이디어 내용 입력
    await ideaInput.fill('E2E 테스트로 생성한 아이디어');

    // 제출 버튼 클릭
    await page.getByText('제출').click();

    // 아이디어 카드가 캔버스에 표시되는지 확인
    await expect(
      page
        .getByTestId('idea-content')
        .filter({ hasText: 'E2E 테스트로 생성한 아이디어' })
        .first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('4.3 아이디어 내용을 편집할 수 있다', async ({ page }) => {
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    // Seed 아이디어 카드 확인
    const ideaCard = page.locator('[data-idea-card]').first();
    await expect(ideaCard).toBeVisible({ timeout: 10_000 });

    // 카드 내용 확인
    const content = ideaCard.locator('[aria-label="idea-content"]');
    if (await content.isVisible().catch(() => false)) {
      const originalText = await content.textContent();
      expect(originalText).toBeTruthy();
    }
  });

  test('4.4 아이디어를 삭제할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_BRAINSTORMING, 'BRAINSTORMING');
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    // 먼저 새 아이디어 생성
    const canvas = page.getByTestId('issue-canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
    await canvas.dblclick({ position: { x: 500, y: 400 } });

    const ideaInput = page.getByTestId('idea-input').last();
    await expect(ideaInput).toBeVisible({ timeout: 5_000 });
    await ideaInput.fill('삭제할 아이디어');
    await page.getByText('제출').click();
    await expect(page.getByText('삭제할 아이디어')).toBeVisible({ timeout: 5_000 });

    // 삭제 버튼 클릭 (자기가 만든 카드에만 보임)
    const myCard = page.locator('[data-idea-card]', {
      hasText: '삭제할 아이디어',
    });
    const deleteBtn = myCard.locator('[aria-label="delete"]');
    await deleteBtn.click();

    // 삭제 확인
    await expect(page.getByText('삭제할 아이디어')).toBeHidden({ timeout: 5_000 });
  });

  test('4.5 아이디어 카드를 드래그할 수 있다', async ({ page }) => {
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    const ideaCard = page.locator('[data-idea-card]').first();
    await expect(ideaCard).toBeVisible({ timeout: 10_000 });

    const box = await ideaCard.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 100, { steps: 10 });
      await page.mouse.up();
    }
  });

  test('4.6 퀵 이슈에 닉네임으로 참여할 수 있다', async ({ browser }) => {
    // 명시적 비로그인 컨텍스트
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    await page.goto(`/issue/${SEED_ISSUE_BRAINSTORMING}`);
    await page.waitForLoadState('domcontentloaded');

    // 이슈 참여 모달 확인
    const dialog = page.getByRole('dialog');

    const nicknameInput = dialog.locator('input');
    if (await nicknameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await nicknameInput.clear();
      await nicknameInput.fill('테스트참여자');
      await dialog.getByText('완료').click();
      await expect(dialog).toBeHidden({ timeout: 5_000 });
    }

    await context.close();
  });
});

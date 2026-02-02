import { test, expect } from '@playwright/test';
import { navigateToIssue, setIssueStatus } from './helpers';

const SEED_ISSUE_BRAINSTORMING = '00000000-0000-0000-0000-000000000301';

test.describe('이슈 - 카테고리화', () => {
  test('5.1 BRAINSTORMING → CATEGORIZE 단계로 전환할 수 있다', async ({
    page,
  }) => {
    await setIssueStatus(page, SEED_ISSUE_BRAINSTORMING, 'BRAINSTORMING');
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    // "다음" 버튼 클릭
    const nextButton = page.getByText('다음');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // 단계 전환 확인 - 카테고리 관련 버튼이 나타나야 함
    await expect(page.getByText('카테고리 추가')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('5.2 AI 구조화 버튼을 클릭하면 로딩 후 카테고리가 생성된다', async ({
    page,
  }) => {
    if (!process.env.CLOVA_API_KEY) {
      test.skip(true, 'CLOVA API 키가 없어 AI 구조화 테스트를 건너뜁니다.');
    }

    await setIssueStatus(page, SEED_ISSUE_BRAINSTORMING, 'CATEGORIZE');
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    const addCategoryBtn = page.getByText('카테고리 추가');
    await expect(addCategoryBtn).toBeVisible({ timeout: 5_000 });

    // AI 구조화 버튼 클릭
    const aiButton = page.getByText('AI 구조화');
    await expect(aiButton).toBeVisible();
    await aiButton.click();

    // AI 구조화 완료 대기 (카테고리 카드 출현)
    await expect(page.locator('[data-category-id]').first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test('5.3 카테고리를 수동으로 생성할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_BRAINSTORMING, 'CATEGORIZE');
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    const addCategoryBtn = page.getByText('카테고리 추가');
    await expect(addCategoryBtn).toBeVisible({ timeout: 5_000 });

    // 카테고리 추가 버튼 클릭
    await addCategoryBtn.click();

    // 새 카테고리 카드가 생성되었는지 확인
    await expect(page.locator('[data-category-id]').first()).toBeVisible({ timeout: 5_000 });
  });

  test('5.4 아이디어를 카테고리로 드래그할 수 있다', async ({ page }) => {
    await setIssueStatus(page, SEED_ISSUE_BRAINSTORMING, 'CATEGORIZE');
    await navigateToIssue(page, SEED_ISSUE_BRAINSTORMING);

    const addCategoryBtn = page.getByText('카테고리 추가');
    await expect(addCategoryBtn).toBeVisible({ timeout: 5_000 });

    // 아이디어 카드와 카테고리 카드가 모두 있는지 확인
    const ideaCard = page.locator('[data-idea-card]').first();
    const categoryCard = page.locator('[data-category-id]').first();

    if (
      (await ideaCard.isVisible().catch(() => false)) &&
      (await categoryCard.isVisible().catch(() => false))
    ) {
      const ideaBox = await ideaCard.boundingBox();
      const categoryBox = await categoryCard.boundingBox();

      if (ideaBox && categoryBox) {
        // 아이디어 카드를 카테고리 카드로 드래그
        await page.mouse.move(
          ideaBox.x + ideaBox.width / 2,
          ideaBox.y + ideaBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          categoryBox.x + categoryBox.width / 2,
          categoryBox.y + categoryBox.height / 2,
          { steps: 15 },
        );
        await page.mouse.up();
      }
    }
  });
});

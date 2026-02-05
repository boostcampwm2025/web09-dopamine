import { test, expect } from '@playwright/test';

const SEED_PROJECT_ID = '00000000-0000-0000-0000-000000000101';
const SEED_TOPIC_ID = '00000000-0000-0000-0000-000000000201';

test.describe('토픽 관리', () => {
  test('3.1 프로젝트 상세에서 토픽 목록이 표시된다', async ({ page }) => {
    await page.goto(`/project/${SEED_PROJECT_ID}`);

    // 토픽 목록 섹션 확인
    await expect(page.getByText('토픽 목록')).toBeVisible();

    // Seed 토픽 확인
    await expect(page.getByText('Product')).toBeVisible();
    await expect(page.getByText('Growth')).toBeVisible();
  });

  test('3.2 토픽을 생성할 수 있다', async ({ page }) => {
    await page.goto(`/project/${SEED_PROJECT_ID}`);

    // 토픽 생성 버튼 클릭
    const createButton = page.locator('button', { hasText: /토픽|추가|만들기/ });
    await createButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 토픽 제목 입력
    const titleInput = dialog.locator('input').first();
    await titleInput.fill('E2E 테스트 토픽');

    // 완료 버튼 클릭
    await dialog.getByText('완료').click();
    await expect(dialog).toBeHidden();

    // 생성된 토픽 확인
    await expect(page.getByRole('link', { name: 'E2E 테스트 토픽' }).first()).toBeVisible();
  });

  test('3.3 토픽 캔버스에서 이슈 노드가 렌더링된다', async ({ page }) => {
    await page.goto(`/topic/${SEED_TOPIC_ID}`);

    // ReactFlow 캔버스가 렌더링되는지 확인
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10_000 });

    // Seed 이슈 노드 확인 (Product 토픽의 "Improve retention")
    await expect(page.getByText('Improve retention')).toBeVisible();
  });
});

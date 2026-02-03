import { Page } from '@playwright/test';

/**
 * 이슈 페이지 접근 시 "이슈 참여" 모달이 뜨면 닉네임을 입력하고 참여한다.
 * Alice가 멤버가 아닌 이슈에 접근할 때 필요.
 */
export async function joinIssueIfNeeded(page: Page, nickname = 'Alice') {
  const dialog = page.getByRole('dialog');
  const joinModal = dialog.getByText('이슈 참여');

  if (await joinModal.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const nicknameInput = dialog.locator('input, textbox').first();
    await nicknameInput.clear();
    await nicknameInput.fill(nickname);
    await dialog.getByText('완료').click();

    // 모달이 닫힐 때까지 대기
    await joinModal.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }
}

/**
 * 이슈 페이지로 이동하고, 참여 모달 처리 후 캔버스가 로드될 때까지 대기한다.
 */
export async function navigateToIssue(page: Page, issueId: string) {
  await page.goto(`/issue/${issueId}`);
  await page.waitForLoadState('domcontentloaded');
  await joinIssueIfNeeded(page);

  // 에러 페이지가 뜨면 다시 시도
  const errorHeading = page.getByText('앗! 문제가 발생했어요');
  if (await errorHeading.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await page.getByText('다시 시도').click();
    await page.waitForLoadState('domcontentloaded');
    await joinIssueIfNeeded(page);
  }

  // 캔버스가 나타날 때까지 대기 (SSE 등으로 networkidle이 끝나지 않을 수 있음)
  const canvas = page.getByTestId('issue-canvas');
  await canvas.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
}

/**
 * 이슈 상태를 강제로 설정한다 (테스트용).
 */
export async function setIssueStatus(page: Page, issueId: string, status: string) {
  await page.request.patch(`/api/issues/${issueId}/status`, {
    data: { status },
  });
}

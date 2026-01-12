/**
 * 이슈 관련 API 함수들
 */

/**
 * 이슈의 현재 상태를 가져옵니다.
 */
export async function fetchIssueStatus(issueId: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}/status`);
    if (response.ok) {
      const data = await response.json();
      return data.status;
    }
    return null;
  } catch (error) {
    console.error('이슈 상태 가져오기 실패:', error);
    return null;
  }
}

/**
 * AI를 사용하여 아이디어들을 카테고리별로 분류합니다.
 */
export async function categorizeIdeas(
  issueId: string,
  ideas: Array<{ id: string; content: string }>,
) {
  const payload = {
    issueId,
    ideas,
  };

  const response = await fetch(`/api/issues/${issueId}/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('AI 분류 실패');
  }

  const data = await response.json();
  const content = data.result?.message?.content;

  if (!content) {
    throw new Error('AI 응답 형식이 올바르지 않습니다.');
  }

  return JSON.parse(content);
}

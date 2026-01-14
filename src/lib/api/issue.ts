/**
 * 이슈 관련 API 함수들
 */

export async function createQuickIssue(title: string, nickname: string) {
  try {
    const response = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        nickname,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('빠른 이슈 생성 실패:', error);
    return null;
  }
}

export async function getIssueMembers(issueId: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}/members`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('이슈 상태 가져오기 실패:', error);
    return null;
  }
}

/**
 * 이슈의 현재 상태를 가져옵니다.
 */
export async function getIssue(issueId: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}`);
    if (response.ok) {
      const data = await response.json();
      return data;
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

/**
 * 이슈 상태를 변경합니다.
 */
export async function updateIssueStatus(
  issueId: string,
  status: string,
  selectedIdeaId?: string,
  memo?: string,
) {
  try {
    const response = await fetch(`/api/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        selectedIdeaId,
        memo,
      }),
    });

    if (!response.ok) {
      throw new Error('이슈 상태 변경 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('이슈 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * AI 카테고리 결과를 DB에 반영합니다.
 */
export async function applyAIStructure(
  issueId: string,
  categories: Array<{ title: string; ideaIds: string[] }>,
) {
  const response = await fetch(`/api/issues/${issueId}/ai-structure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categories }),
  });

  if (!response.ok) {
    throw new Error('AI 구조화 적용 실패');
  }

  return response.json();
}

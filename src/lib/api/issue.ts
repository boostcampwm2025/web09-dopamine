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
    throw new Error('빠른 이슈 생성 실패');
  }
}

// 이슈 아이디로 이슈에 참여한 멤버들 조회
export async function getIssueMembers(issueId: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}/members`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('이슈 멤버 조회 실패:', error);
    return null;
  }
}

// 특정 사용자의 정보 조회
export async function getIssueMember(issueId: string, userId: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}/members/${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return null;
  }
}

export async function checkNicknameDuplicate(issueId: string, nickname: string) {
  const encodedNickname = encodeURIComponent(nickname);
  try {
    const response = await fetch(`/api/issues/${issueId}/members?nickname=${encodedNickname}`);

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    return null;
  } catch (error) {
    console.error('멤버 조회 실패:', error);
    throw new Error('멤버 조회 실패');
  }
}

export async function generateNickname(issueId: string) {
  const response = await fetch(`/api/issues/${issueId}/members-nickname`, {
    method: 'POST',
  });

  try {
    if (response.ok) {
      const data = await response.json();
      return data;
    }

    return null;
  } catch (error) {
    console.error('닉네임 생성 실패:', error);
    throw new Error('닉네임 생성 실패');
  }
}

// 이슈에 참가
export async function joinIssue(issueId: string, nickname: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('이슈 참여 실패:', error);
    throw new Error('이슈 참여 실패');
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
 * AI를 사용하여 아이디어들을 카테고리별로 분류하고 DB에 저장합니다.
 */
export async function categorizeIdeas(
  issueId: string,
  ideas: Array<{ id: string; content: string }>,
) {
  const response = await fetch(`/api/issues/${issueId}/categorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ideas }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'AI 분류 실패');
  }

  return response.json();
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
 * 이슈가 SELECT 상태인 경우 selected-idea를 브로드캐스팅합니다.
 */
export async function selectIdea(issueId: string, selectedIdeaId: string) {
  try {
    const response = await fetch(`/api/issues/${issueId}/selected-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedIdeaId }),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Failed to select idea:', error);
    return null;
  }
}


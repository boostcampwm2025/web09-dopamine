/**
 * 이슈 관련 API 함수들 (공통 응답 포맷 사용)
 */
import getAPIResponseData from '@/lib/utils/api-response';

/* =========================
 * Issue
 * ========================= */

export function createQuickIssue(title: string, nickname: string) {
  return getAPIResponseData<{
    issueId: string;
    userId: string;
  }>({
    url: '/api/issues',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, nickname }),
  });
}

export function getIssue(issueId: string) {
  return getAPIResponseData<{
    id: string;
    title: string;
    status: string;
    topicId?: string | null;
    createdAt: string;
    updatedAt: string;
  }>({
    url: `/api/issues/${issueId}`,
    method: 'GET',
  });
}

export function updateIssueStatus(
  issueId: string,
  status: string,
  selectedIdeaId?: string,
  memo?: string,
) {
  return getAPIResponseData<{
    id: string;
    title: string;
    status: string;
    topicId?: string | null;
    createdAt: string;
    updatedAt: string;
  }>({
    url: `/api/issues/${issueId}/status`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, selectedIdeaId, memo }),
  });
}

/* =========================
 * Issue Members
 * ========================= */

export function getIssueMembers(issueId: string) {
  return getAPIResponseData<
    Array<{
      id: string;
      displayName: string;
      role: string;
      isConnected: boolean;
    }>
  >({
    url: `/api/issues/${issueId}/members`,
    method: 'GET',
  });
}

export function getIssueMember(issueId: string, userId: string) {
  return getAPIResponseData<{
    id: string;
    displayName: string;
    role: string;
  }>({
    url: `/api/issues/${issueId}/members/${userId}`,
    method: 'GET',
  });
}

export function joinIssue(issueId: string, nickname: string) {
  return getAPIResponseData<{
    userId: string;
  }>({
    url: `/api/issues/${issueId}/members`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  });
}

export function joinIssueAsLoggedInUser(issueId: string) {
  return getAPIResponseData<{
    userId: string;
  }>({
    url: `/api/issues/${issueId}/members`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

export function checkNicknameDuplicate(issueId: string, nickname: string) {
  const encodedNickname = encodeURIComponent(nickname);
  return getAPIResponseData<{
    isDuplicate: boolean;
  }>({
    url: `/api/issues/${issueId}/members?nickname=${encodedNickname}`,
    method: 'GET',
  });
}

export function generateNickname(issueId: string) {
  return getAPIResponseData<{
    nickname: string;
  }>({
    url: `/api/issues/${issueId}/members-nickname`,
    method: 'POST',
  });
}

/* =========================
 * AI / Structuring
 * ========================= */

export function categorizeIdeas(issueId: string) {
  return getAPIResponseData<{
    categories: Array<{ id: string }>;
    ideaCategoryMap: Record<string, string>;
  }>({
    url: `/api/issues/${issueId}/categorize`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

/* =========================
 * Selected Idea
 * ========================= */

export function selectIdea(issueId: string, selectedIdeaId: string) {
  return getAPIResponseData<{
    ok: boolean;
  }>({
    url: `/api/issues/${issueId}/selected-idea`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedIdeaId }),
  });
}

export function createIssueInTopic(topicId: string, title: string) {
  return getAPIResponseData<{
    issueId: string;
  }>({
    url: `/api/topics/${topicId}/issues`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

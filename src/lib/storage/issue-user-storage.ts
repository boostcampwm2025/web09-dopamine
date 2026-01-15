/**
 * 이슈별 사용자 ID를 로컬스토리지에 저장/조회하는 유틸리티
 */

const STORAGE_KEY = 'issue-user-map';

interface IssueUserMap {
  [issueId: string]: string;
}

/**
 * 로컬스토리지에서 이슈별 사용자 맵을 가져옵니다.
 */
function getIssueUserMap(): IssueUserMap {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('이슈-사용자 맵 조회 실패:', error);
    return {};
  }
}

/**
 * 로컬스토리지에 이슈별 사용자 맵을 저장합니다.
 */
function setIssueUserMap(map: IssueUserMap): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('이슈-사용자 맵 저장 실패:', error);
  }
}

/**
 * 특정 이슈의 사용자 ID를 가져옵니다.
 */
export function getUserIdForIssue(issueId: string): string {
  const map = getIssueUserMap();
  return map[issueId];
}

/**
 * 특정 이슈의 사용자 ID를 저장합니다.
 */
export function setUserIdForIssue(issueId: string, userId: string): void {
  const map = getIssueUserMap();
  map[issueId] = userId;
  setIssueUserMap(map);
}

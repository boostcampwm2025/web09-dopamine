/**
 * 상대 시간 포맷팅: 날짜를 '방금 전', 'n시간 전' 등의 읽기 쉬운 형태로 변환
 */
export function formatRelativeTime(createdAt: Date | string, now = Date.now()) {
  const date = new Date(createdAt);

  // 유효하지 않은 날짜 형식 예외 처리
  if (Number.isNaN(date.getTime())) {
    return '작성 시간 정보 없음';
  }

  const diffMs = now - date.getTime();

  // 시간 차이에 따른 문구 반환 (단위: 밀리초 -> 분 -> 시간 -> 일 -> 개월 -> 년)
  if (diffMs < 60_000) return '방금 전';

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}일 전`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}개월 전`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}년 전`;
}

import type { Comment } from '@/lib/api/comment';

// Comment 타입에서 시간과 유저 정보만 추출하여 타입 정의
type CommentMetaSource = Pick<Comment, 'createdAt' | 'user'>;

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

/**
 * 메타 정보 결합: 작성자 이름과 포맷팅된 시간을 하나의 문자열로 결합
 */
export function getCommentMeta(comment: CommentMetaSource) {
  // 표시 이름 -> 이름 -> 익명 순으로 우선순위 결정
  const author = comment.user?.displayName || comment.user?.name || '익명';

  // 위에서 만든 함수를 이용해 시간 텍스트 생성
  const timeText = formatRelativeTime(comment.createdAt);
  return `${author} · ${timeText}`;
}

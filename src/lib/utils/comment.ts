import type { Comment } from '@/lib/api/comment';
import { formatRelativeTime } from '@/lib/utils/time';

// Comment 타입에서 시간과 유저 정보만 추출하여 타입 정의
type CommentMetaSource = Pick<Comment, 'createdAt' | 'user'>;

/**
 * 메타 정보 결합: 작성자 이름과 포맷팅된 시간을 하나의 문자열로 결합
 */
export function getCommentMeta(comment: CommentMetaSource) {
  // nickname -> 이름 -> 익명 순으로 우선순위 결정
  const author = comment.user?.nickname || comment.user?.name || '익명';

  // 위에서 만든 함수를 이용해 시간 텍스트 생성
  const timeText = formatRelativeTime(comment.createdAt);
  return `${author} · ${timeText}`;
}

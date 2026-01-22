import type { IdeaWithPosition } from '@/app/(with-sidebar)/issue/types/idea';

/**
 * 댓글 개수 기준으로 상위 3개 아이디어 ID를 반환
 * - 댓글이 3개 이상인 아이디어 중에서 상위 3개까지 선택
 * - 동점이 있어서 3개를 초과하면 해당 동점 그룹 전체를 제외
 */
export function getActiveDiscussionIdeaIds(ideas: IdeaWithPosition[]): Set<string> {
  // 댓글이 0개인 아이디어는 제외
  const ideasWithComments = ideas.filter((idea) => (idea.comments?.length ?? 0) >= 3);

  if (ideasWithComments.length === 0) {
    return new Set();
  }

  // 댓글 개수별로 그룹화
  const commentCountMap = new Map<number, string[]>();

  ideasWithComments.forEach((idea) => {
    const count = idea.comments?.length ?? 0;
    if (!commentCountMap.has(count)) {
      commentCountMap.set(count, []);
    }
    commentCountMap.get(count)!.push(idea.id);
  });

  // 댓글 개수를 내림차순 정렬
  const sortedCounts = Array.from(commentCountMap.keys()).sort((a, b) => b - a);

  const topIdeaIds: string[] = [];

  for (const count of sortedCounts) {
    const ideasWithCount = commentCountMap.get(count)!;

    // 현재 개수의 아이디어를 추가했을 때 3개를 초과하면 중단
    if (topIdeaIds.length + ideasWithCount.length > 3) {
      break;
    }

    topIdeaIds.push(...ideasWithCount);

    // 3개 이상이 되면 중단 (3개 정확히, 또는 3개 미만)
    if (topIdeaIds.length >= 3) {
      break;
    }
  }

  // 1개 이상이면 반환 (최대 3개)
  return new Set(topIdeaIds);
}

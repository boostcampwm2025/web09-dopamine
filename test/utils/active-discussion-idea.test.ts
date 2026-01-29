import { getActiveDiscussionIdeaIds } from '@/lib/utils/active-discussion-idea';

const makeIdea = (id: string, commentCount: number) => ({
  id,
  commentCount,
});

describe('getActiveDiscussionIdeaIds', () => {
  it('댓글 3개 미만 아이디어만 있으면 빈 Set을 반환한다', () => {
    // 댓글 조건(3개 이상)을 만족하지 않는 데이터
    const ideas = [makeIdea('idea-1', 0), makeIdea('idea-2', 2)] as any;

    const result = getActiveDiscussionIdeaIds(ideas);

    expect(result.size).toBe(0);
  });

  it('댓글 수 상위 3개 아이디어 ID를 반환한다', () => {
    // 댓글 수 내림차순으로 3개까지 선택되는지 확인
    const ideas = [
      makeIdea('idea-1', 5),
      makeIdea('idea-2', 4),
      makeIdea('idea-3', 3),
      makeIdea('idea-4', 2),
    ] as any;

    const result = getActiveDiscussionIdeaIds(ideas);
    const resultIds = Array.from(result).sort();

    expect(resultIds).toEqual(['idea-1', 'idea-2', 'idea-3']);
  });

  it('동점 그룹이 3개 초과를 만들면 해당 그룹을 제외한다', () => {
    // 상위 2개 이후 동점 그룹이 3개 초과를 만들면 제외
    const ideas = [
      makeIdea('idea-1', 5),
      makeIdea('idea-2', 4),
      makeIdea('idea-3', 3),
      makeIdea('idea-4', 3),
    ] as any;

    const result = getActiveDiscussionIdeaIds(ideas);
    const resultIds = Array.from(result).sort();

    expect(resultIds).toEqual(['idea-1', 'idea-2']);
  });
});

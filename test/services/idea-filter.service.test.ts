import { ideaFilterService } from '@/lib/services/idea-filter.service';

describe('ideaFilterService.getFilteredIdeaIds', () => {
  it('필터가 none이면 빈 Set을 반환한다', () => {
    const result = ideaFilterService.getFilteredIdeaIds(
      [{ id: 'idea-1', agreeCount: 2, disagreeCount: 0 }],
      'none',
    );

    expect(result.size).toBe(0);
  });

  it('아이디어 배열이 비면 빈 Set을 반환한다', () => {
    const result = ideaFilterService.getFilteredIdeaIds([], 'most-liked');

    expect(result.size).toBe(0);
  });

  it('most-liked는 diff 기준 상위 3개와 동률을 포함한다', () => {
    const ideas = [
      { id: 'idea-a', agreeCount: 5, disagreeCount: 0 }, // diff 5
      { id: 'idea-b', agreeCount: 4, disagreeCount: 0 }, // diff 4
      { id: 'idea-c', agreeCount: 2, disagreeCount: 0 }, // diff 2 (3rd)
      { id: 'idea-e', agreeCount: 2, disagreeCount: 1 }, // diff 1 (should be excluded)
      { id: 'idea-d', agreeCount: 2, disagreeCount: 0 }, // diff 2 (tie)
    ];

    const result = ideaFilterService.getFilteredIdeaIds(ideas, 'most-liked');

    expect([...result].sort()).toEqual(['idea-a', 'idea-b', 'idea-c', 'idea-d'].sort());
  });

  it('need-discussion은 논의 필요 조건으로 필터하고 동률(agree)을 포함한다', () => {
    const ideas = [
      { id: 'idea-a', agreeCount: 5, disagreeCount: 5 }, // diff 0, total 10
      { id: 'idea-b', agreeCount: 4, disagreeCount: 4 }, // diff 0, total 8
      { id: 'idea-c', agreeCount: 3, disagreeCount: 2 }, // diff 1, total 5 (0.2)
      { id: 'idea-d', agreeCount: 3, disagreeCount: 3 }, // diff 0, total 6 (tie)
      { id: 'idea-e', agreeCount: 10, disagreeCount: 0 }, // diff 10, not candidate
      { id: 'idea-f', agreeCount: 0, disagreeCount: 0 }, // total 0, excluded
    ];

    const result = ideaFilterService.getFilteredIdeaIds(ideas, 'need-discussion');

    expect([...result].sort()).toEqual(['idea-a', 'idea-b', 'idea-c', 'idea-d'].sort());
  });
});

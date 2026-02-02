/**
 * @jest-environment jsdom
 */
import { useIssueIdeaQuery } from '@/hooks';
import * as ideaApi from '@/lib/api/idea';
import { renderHook, waitFor } from '../../utils/test-utils';

// 1. API 모킹
jest.mock('@/lib/api/idea');

describe('Idea Queries', () => {
  const issueId = 'issue-1';

  // Mock 함수들
  const mockFetchIdeas = ideaApi.fetchIdeas as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useIssueIdeaQuery (아이디어 목록 조회 및 변환)', () => {
    test('DB 데이터를 받아와서 IdeaWithPosition 형태로 올바르게 변환해야 한다', async () => {
      // Given: 다양한 케이스를 포함한 Mock 데이터 구성
      const mockDbIdeas = [
        // Case 1: 모든 데이터가 완벽하게 있는 경우
        {
          id: '1',
          userId: 'user-1',
          content: 'Full Info',
          positionX: 100,
          positionY: 200,
          nickname: 'NickName',
          categoryId: 'cat-1',
          agreeCount: 0,
          disagreeCount: 0,
          commentCount: 0,
          isSelected: false,
          myVote: null,
        },
        // Case 2: 좌표가 둘 다 없는 경우 & isSelected가 true인 경우
        {
          id: '2',
          userId: 'user-2',
          content: 'No Position',
          positionX: null,
          positionY: null,
          nickname: 'AnotherUser',
          categoryId: null,
          agreeCount: 5,
          disagreeCount: 1,
          commentCount: 2,
          isSelected: true,
          myVote: 'AGREE',
        },
        // Case 3: isSelected가 없고(undefined), 좌표가 하나만 있는 경우
        {
          id: '3',
          userId: 'user-3',
          content: 'Edge Case',
          positionX: 100, // X는 있는데
          positionY: null, // Y가 없음 -> 결과는 position: null 이어야 함
          nickname: 'EdgeUser',
          categoryId: null,
          agreeCount: 0,
          disagreeCount: 0,
          commentCount: 0,
          isSelected: undefined, // 값이 없음 -> 결과는 false 이어야 함 (?? false 커버)
          myVote: null,
        },
      ];

      mockFetchIdeas.mockResolvedValue(mockDbIdeas);

      // When
      const { result } = renderHook(() => useIssueIdeaQuery(issueId));

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const ideas = result.current.data;

      // 1. 첫 번째 아이디어 검증 (정상)
      expect(ideas?.[0]).toEqual(
        expect.objectContaining({
          id: '1',
          position: { x: 100, y: 200 },
          isSelected: false,
        }),
      );

      // 2. 두 번째 아이디어 검증 (좌표 둘 다 없음)
      expect(ideas?.[1]).toEqual(
        expect.objectContaining({
          id: '2',
          position: null,
          isSelected: true,
        }),
      );

      // 세 번째 아이디어 검증 (Edge Case)
      expect(ideas?.[2]).toEqual(
        expect.objectContaining({
          id: '3',
          // 좌표가 하나라도 비면 null이어야 함
          position: null,
          // isSelected가 undefined면 기본값 false여야 함
          isSelected: false,
        }),
      );
    });
  });
});

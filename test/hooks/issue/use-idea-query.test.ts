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
      // Given: 구현 코드(SimpleIdea 타입)에 맞춰 Mock 데이터 구성
      const mockDbIdeas = [
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
      ];

      mockFetchIdeas.mockResolvedValue(mockDbIdeas);

      // When
      const { result } = renderHook(() => useIssueIdeaQuery(issueId));

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const ideas = result.current.data;

      // 1. 첫 번째 아이디어 검증 (모든 필드 존재)
      expect(ideas?.[0]).toEqual(
        expect.objectContaining({
          id: '1',
          author: 'NickName', // nickname -> author 매핑 확인
          position: { x: 100, y: 200 }, // 좌표 변환 확인
          editable: false,
        }),
      );

      // 2. 두 번째 아이디어 검증 (좌표 없음 -> null, 선택된 상태)
      expect(ideas?.[1]).toEqual(
        expect.objectContaining({
          id: '2',
          author: 'AnotherUser',
          position: null, // null 확인
          isSelected: true,
          myVote: 'AGREE',
        }),
      );
    });
  });
});

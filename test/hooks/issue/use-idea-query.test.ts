/**
 * @jest-environment jsdom
 */
import { useIdeaQuery, useIssueIdeaQuery } from '@/hooks';
import * as ideaApi from '@/lib/api/idea';
import { renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. API 모킹
jest.mock('@/lib/api/idea');

describe('Idea Queries', () => {
  const issueId = 'issue-1';
  const userId = 'user-1';

  // Mock 함수들
  const mockGetIdea = ideaApi.getIdea as jest.Mock;
  const mockFetchIdeas = ideaApi.fetchIdeas as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useIdeaQuery (단일 아이디어 조회)', () => {
    test('정상적인 ID인 경우 API를 호출하고 데이터를 반환해야 한다', async () => {
      // Given
      const ideaId = 'idea-123';
      const mockData = { id: ideaId, content: 'Idea Content' };
      mockGetIdea.mockResolvedValue(mockData);

      // When
      const { result } = renderHook(() => useIdeaQuery(issueId, ideaId, userId));

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(mockGetIdea).toHaveBeenCalledWith(issueId, ideaId, userId);
    });

    test('임시 ID("temp-")인 경우 API를 호출하지 않아야 한다 (Enabled: false)', () => {
      // Given
      const tempId = 'temp-12345'; // 클라이언트에서 생성한 임시 ID

      // When
      const { result } = renderHook(() => useIdeaQuery(issueId, tempId, userId));

      // Then
      // 데이터 로딩 시도조차 하지 않아야 함 (fetchStatus: idle)
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockGetIdea).not.toHaveBeenCalled();
    });
  });

  describe('useIssueIdeaQuery (아이디어 목록 조회 및 변환)', () => {
    test('DB 데이터를 받아와서 IdeaWithPosition 형태로 올바르게 변환해야 한다', async () => {
      // Given: 다양한 케이스의 DB 원본 데이터 시뮬레이션
      const mockDbIdeas = [
        {
          id: '1',
          content: 'Full Info',
          positionX: 100,
          positionY: 200,
          user: { displayName: 'NickName', name: 'RealName' }, // 1순위: displayName
        },
        {
          id: '2',
          content: 'No DisplayName',
          positionX: 50,
          positionY: 50,
          user: { displayName: null, name: 'RealName' }, // 2순위: name
        },
        {
          id: '3',
          content: 'No User Info',
          positionX: null, // 위치 정보 없음
          positionY: null,
          user: null, // 3순위: '익명'
        },
      ];

      mockFetchIdeas.mockResolvedValue(mockDbIdeas);

      // When
      const { result } = renderHook(() => useIssueIdeaQuery(issueId));

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const ideas = result.current.data;

      // 1. 첫 번째 아이디어 검증 (닉네임, 위치 객체)
      expect(ideas?.[0]).toEqual(
        expect.objectContaining({
          id: '1',
          author: 'NickName', // displayName 우선
          position: { x: 100, y: 200 }, // 객체로 변환됨
          editable: false,
        }),
      );

      // 2. 두 번째 아이디어 검증 (실명)
      expect(ideas?.[1]).toEqual(
        expect.objectContaining({
          id: '2',
          author: 'RealName', // name 차순
          position: { x: 50, y: 50 },
        }),
      );

      // 3. 세 번째 아이디어 검증 (익명, 위치 null)
      expect(ideas?.[2]).toEqual(
        expect.objectContaining({
          id: '3',
          author: '익명', // 유저 정보 없으면 익명
          position: null, // 좌표 없으면 null
          editable: false,
        }),
      );
    });
  });
});

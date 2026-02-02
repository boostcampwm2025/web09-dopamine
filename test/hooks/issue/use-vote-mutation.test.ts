/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useVoteMutation } from '@/hooks';
import * as voteApi from '@/lib/api/vote';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/vote');
jest.mock('react-hot-toast');

// 2. React Query 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

// useSseConnectionStore 모킹 (hook 내부에서 사용중이므로 필요)
jest.mock('@/app/(with-sidebar)/issue/store/use-sse-connection-store', () => ({
  useSseConnectionStore: jest.fn((selector) => selector({ connectionIds: {} })),
}));

describe('useVoteMutation', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const queryKey = ['issues', issueId, 'ideas'];

  const mockPostVote = voteApi.postVote as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  const mockGetQueryData = jest.fn();
  const mockSetQueryData = jest.fn();
  const mockCancelQueries = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
      cancelQueries: mockCancelQueries,
      invalidateQueries: mockInvalidateQueries,
    });
  });

  describe('vote (투표)', () => {
    const initialIdea = {
      id: ideaId,
      agreeCount: 10,
      disagreeCount: 5,
      myVote: null,
    };
    const initialData = [initialIdea];

    test('성공 시 낙관적 업데이트를 수행하고, 최종적으로 쿼리를 무효화해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialData);
      mockPostVote.mockResolvedValue({});

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When: 'AGREE' 투표
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'AGREE' });
      });

      // Then
      // 1. 쿼리 취소 확인
      expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey });

      // 2. [낙관적 업데이트] 검증
      expect(mockSetQueryData).toHaveBeenCalledTimes(1);

      // 전달된 두 번째 인자(데이터)를 가져옵니다.
      const passedData = mockSetQueryData.mock.calls[0][1];

      // 1) 배열인지 확인
      expect(Array.isArray(passedData)).toBe(true);

      // 2) 내용 확인 (낙관적 업데이트가 반영되었는지)
      expect(passedData[0]).toEqual(
        expect.objectContaining({
          id: ideaId,
        }),
      );

      // 3. API 호출 확인
      expect(mockPostVote).toHaveBeenCalledWith(
        expect.objectContaining({
          issueId,
          ideaId,
          userId: 'user-1',
          voteType: 'AGREE',
        }),
      );

      // 4. [성공 후 처리] 검증
      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
      });
    });

    test('실패 시 이전 투표 상태로 롤백해야 한다', async () => {
      // Given
      const previousIdea = { ...initialIdea, myVote: 'DISAGREE' };
      const previousData = [previousIdea]; // 배열 형태

      mockGetQueryData.mockReturnValue(previousData);
      mockPostVote.mockRejectedValue(new Error('Vote Failed'));

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'AGREE' });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Vote Failed'));

      // 롤백 확인: onError에서 context.previousIdeas(배열)로 복구
      expect(mockSetQueryData).toHaveBeenLastCalledWith(queryKey, previousData);

      // onSettled 확인
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
  });
});

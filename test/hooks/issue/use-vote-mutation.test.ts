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

// 3. Store 모킹
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

    // console.error 모킹 (테스트 로그 오염 방지)
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('vote (투표)', () => {
    // 테스트 데이터: 타겟 아이디어와 다른 아이디어 2개를 준비
    const targetIdea = { id: ideaId, agreeCount: 10, myVote: null };
    const otherIdea = { id: 'idea-2', agreeCount: 5, myVote: null };
    const initialData = [targetIdea, otherIdea];

    test('성공 시 낙관적 업데이트(타겟만 변경)를 수행하고 최종적으로 쿼리를 무효화해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialData);
      mockPostVote.mockResolvedValue({});

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When: 'AGREE' 투표
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'AGREE' });
      });

      // Then
      expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey });

      // [낙관적 업데이트 검증]
      // setQueryData에 전달된 updater 함수를 실행해서 결과를 확인해야 정확함
      // (Hook 코드에서 setQueryData(key, data) 형태로 직접 넣었다면 두 번째 인자 확인)
      expect(mockSetQueryData).toHaveBeenCalledTimes(1);
      const passedData = mockSetQueryData.mock.calls[0][1];

      // 타겟 아이디어는 업데이트 되었는가? (여기서는 기존 객체 그대로 반환하는지 확인)
      // 작성하신 코드 로직상 map에서 spread 연산자로 새 객체를 반환하므로 내용물 확인
      expect(passedData[0].id).toBe(ideaId);

      // 다른 아이디어는 건드리지 않았는가? (Branch: idea.id !== ideaId)
      expect(passedData[1]).toEqual(otherIdea);

      // API 호출 확인
      expect(mockPostVote).toHaveBeenCalledWith(
        expect.objectContaining({
          issueId,
          ideaId,
          userId: 'user-1',
          voteType: 'AGREE',
        }),
      );

      // onSettled 확인
      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
      });
    });

    // 캐시가 없을 때 (Branch: if (previousIdeas) false)
    test('캐시된 데이터가 없으면(undefined) 낙관적 업데이트를 수행하지 않아야 한다', async () => {
      // Given: 캐시 없음
      mockGetQueryData.mockReturnValue(undefined);
      mockPostVote.mockResolvedValue({});

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'DISAGREE' });
      });

      // Then
      // 데이터가 없으므로 setQueryData는 호출되면 안 됨
      expect(mockSetQueryData).not.toHaveBeenCalled();

      // 하지만 API 호출과 무효화는 정상적으로 진행되어야 함
      expect(mockPostVote).toHaveBeenCalled();
      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
      });
    });

    test('실패 시 이전 투표 상태로 롤백해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialData);
      mockPostVote.mockRejectedValue(new Error('Vote Failed'));

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'AGREE' });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Vote Failed'));

      // 롤백 확인: onError에서 context.previousIdeas로 복구
      expect(mockSetQueryData).toHaveBeenLastCalledWith(queryKey, initialData);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    // 데이터가 없는 상태에서 실패 시 (Branch: if (context?.previousIdeas) false)
    test('이전 데이터가 없는 상태에서 실패 시 롤백을 수행하지 않아야 한다', async () => {
      // Given: 캐시 없음 -> onMutate에서 previousIdeas: undefined 반환
      mockGetQueryData.mockReturnValue(undefined);
      mockPostVote.mockRejectedValue(new Error('Fail'));

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'AGREE' });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Fail'));

      // context.previousIdeas가 없으므로 setQueryData는 호출되지 않아야 함
      expect(mockSetQueryData).not.toHaveBeenCalled();
    });
  });
});

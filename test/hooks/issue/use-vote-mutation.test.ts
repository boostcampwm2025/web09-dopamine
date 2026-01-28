/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useVoteMutation } from '@/hooks';
import * as voteApi from '@/lib/api/vote';
import { act, renderHook, waitFor } from '../../utils/ui-test-helpers';

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

describe('useVoteMutation', () => {
  const issueId = 'issue-1';
  const ideaId = 'idea-1';
  const queryKey = ['issues', issueId, 'ideas', ideaId];

  // Mock 함수들
  const mockPostVote = voteApi.postVote as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient Spy
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
    // 초기 데이터 (아직 투표 안 함)
    const initialData = {
      agreeCount: 10,
      disagreeCount: 5,
      myVote: null,
    };

    test('성공 시 낙관적 업데이트(즉시 반영) 후 서버 응답으로 동기화해야 한다', async () => {
      // Given
      mockGetQueryData.mockReturnValue(initialData);

      // 서버 응답: 찬성표가 1 증가하고, 내 투표가 'AGREE'로 바뀜
      const serverResponse = {
        agreeCount: 11,
        disagreeCount: 5,
        myVote: 'AGREE',
      };
      mockPostVote.mockResolvedValue(serverResponse);

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When: 'AGREE' 투표
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'AGREE' });
      });

      // Then
      // 1. 쿼리 취소 확인
      expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey });

      // 2. [낙관적 업데이트] 검증
      // setQueryData가 함수형 업데이트로 호출되었으므로, 함수를 추출해 실행해본다.
      // 첫 번째 호출(onMutate)
      expect(mockSetQueryData).toHaveBeenNthCalledWith(1, queryKey, expect.any(Function));

      const optimisticUpdater = mockSetQueryData.mock.calls[0][1];
      const optimisticResult = optimisticUpdater(initialData);

      // UI가 즉시 'AGREE'로 바뀌었는지 확인 (카운트는 아직 그대로일 수 있음, 코드 로직상 myVote만 변경)
      expect(optimisticResult).toEqual({
        ...initialData,
        myVote: 'AGREE',
      });

      // 3. API 호출 확인
      expect(mockPostVote).toHaveBeenCalledWith({
        issueId,
        ideaId,
        userId: 'user-1',
        voteType: 'AGREE',
      });

      // 4. [성공 후 동기화] 검증
      // 두 번째 호출(onSuccess)
      await waitFor(() => expect(mockSetQueryData).toHaveBeenCalledTimes(2));

      const successUpdater = mockSetQueryData.mock.calls[1][1]; // 두 번째 호출의 콜백
      const finalResult = successUpdater(initialData); // 혹은 optimisticResult를 넣어도 됨

      // 서버 데이터(카운트 증가 등)로 덮어씌워졌는지 확인
      expect(finalResult).toEqual(
        expect.objectContaining({
          agreeCount: 11,
          myVote: 'AGREE',
        }),
      );

      // 5. 최종 무효화
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });

    test('실패 시 이전 투표 상태로 롤백해야 한다', async () => {
      // Given: 이미 'DISAGREE'에 투표한 상태였다고 가정
      const previousData = { ...initialData, myVote: 'DISAGREE' };
      mockGetQueryData.mockReturnValue(previousData);

      mockPostVote.mockRejectedValue(new Error('Vote Failed'));

      const { result } = renderHook(() => useVoteMutation(issueId, ideaId));

      // When: 'AGREE'로 변경 시도
      await act(async () => {
        result.current.mutate({ userId: 'user-1', voteType: 'AGREE' });
      });

      // Then
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Vote Failed'));

      // 롤백 확인: setQueryData가 마지막에 원본 데이터(previousData)로 호출되었는지 확인
      // (1번: 낙관적 업데이트, 2번: 에러 롤백)
      expect(mockSetQueryData).toHaveBeenLastCalledWith(queryKey, previousData);

      // onSettled는 항상 실행
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    });
  });
});

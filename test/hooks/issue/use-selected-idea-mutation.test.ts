/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { selectedIdeaQueryKey, useSelectedIdeaMutation } from '@/hooks';
import * as issueApi from '@/lib/api/issue';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/issue');
jest.mock('@/hooks/issue/use-selected-idea-query');
jest.mock('react-hot-toast');

// 2. React Query 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

// 3. Store 모킹 (껍데기 생성)
jest.mock('@/app/(with-sidebar)/issue/store/use-sse-connection-store', () => ({
  useSseConnectionStore: jest.fn(),
}));

describe('useSelectedIdeaMutation', () => {
  const issueId = 'issue-1';
  const connectionId = 'conn-1'; // 테스트용 connectionId
  const queryKey = ['selected-idea', issueId]; // 테스트용 키

  // Mock 함수들
  const mockSelectIdeaAPI = issueApi.selectIdea as jest.Mock;
  const mockSelectedIdeaQueryKey = selectedIdeaQueryKey as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient Spy
  const mockGetQueryData = jest.fn();
  const mockSetQueryData = jest.fn();
  const mockCancelQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // QueryClient 설정
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
      cancelQueries: mockCancelQueries,
    });

    // 쿼리 키 유틸 설정
    mockSelectedIdeaQueryKey.mockReturnValue(queryKey);

    // Store 구현 주입: 특정 issueId에 대해 connectionId 반환
    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: {
          [issueId]: connectionId,
        },
      });
    });
  });

  test('성공 시(낙관적 업데이트) 캐시에 선택된 아이디어 ID를 즉시 반영해야 한다', async () => {
    // Given
    mockSelectIdeaAPI.mockResolvedValue({});
    mockGetQueryData.mockReturnValue('old-idea-id'); // 이전 데이터

    const { result } = renderHook(() => useSelectedIdeaMutation(issueId));
    const newSelectedId = 'new-idea-id';

    // When
    await act(async () => {
      result.current.mutate(newSelectedId);
    });

    // Then
    // 1. 쿼리 취소 확인
    expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey });

    // 2. 낙관적 업데이트 확인 (API 응답 전 즉시 반영)
    expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, newSelectedId);

    // 3. API 호출 확인 (connectionId 포함 3개 인자 확인)
    expect(mockSelectIdeaAPI).toHaveBeenCalledWith(issueId, newSelectedId, connectionId);
  });

  test('실패 시 이전 선택 상태로 롤백해야 한다', async () => {
    // Given
    const previousId = 'old-idea-id';
    mockGetQueryData.mockReturnValue(previousId); // 기존에 'old-idea-id'가 선택되어 있었음
    mockSelectIdeaAPI.mockRejectedValue(new Error('Update Failed'));

    const { result } = renderHook(() => useSelectedIdeaMutation(issueId));

    // When
    await act(async () => {
      result.current.mutate('new-idea-id');
    });

    // Then
    // 1. 에러 토스트 확인
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Update Failed'));

    // 2. 롤백 확인
    expect(mockSetQueryData).toHaveBeenLastCalledWith(queryKey, previousId);
  });

  test('이전 데이터가 없는 상태(undefined)에서도 롤백 처리가 안전하게 되어야 한다', async () => {
    // Given
    mockGetQueryData.mockReturnValue(undefined); // 이전에 선택된 게 없었음
    mockSelectIdeaAPI.mockRejectedValue(new Error('Fail'));

    const { result } = renderHook(() => useSelectedIdeaMutation(issueId));

    // When
    await act(async () => {
      result.current.mutate('new-id');
    });

    // Then
    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(mockSetQueryData).toHaveBeenCalledTimes(1); // 낙관적 업데이트 1회만
    expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, 'new-id');
  });
});

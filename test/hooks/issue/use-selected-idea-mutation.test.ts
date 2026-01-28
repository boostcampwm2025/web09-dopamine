/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { selectedIdeaQueryKey, useSelectedIdeaMutation } from '@/hooks';
import * as issueApi from '@/lib/api/issue';
import { act, renderHook, waitFor } from '../../utils/ui-test-helpers';

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

describe('useSelectedIdeaMutation', () => {
  const issueId = 'issue-1';
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

    // 3. API 호출 확인
    expect(mockSelectIdeaAPI).toHaveBeenCalledWith(issueId, newSelectedId);
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
    // setQueryData는 두 번 호출됨:
    // 첫 번째: 낙관적 업데이트 ('new-idea-id')
    // 두 번째: 에러 발생 후 롤백 ('old-idea-id')
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
    // undefined일 경우 setQueryData가 롤백용으로 호출되지 않아야 함. (낙관적 업데이트용 1번만 호출)
    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(mockSetQueryData).toHaveBeenCalledTimes(1); // 낙관적 업데이트 1회만
    expect(mockSetQueryData).toHaveBeenCalledWith(queryKey, 'new-id');
    // 롤백으로 다시 호출되지 않았음을 의미
  });
});

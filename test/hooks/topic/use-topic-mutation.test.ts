/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useCreateTopicMutation } from '@/hooks';
import { createTopic } from '@/lib/api/topic';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 의존성 모킹 (API, Toast)
jest.mock('@/lib/api/topic');
jest.mock('react-hot-toast');

// 2. React Query의 useQueryClient만 부분 모킹 (invalidateQueries 감시용)
// useMutation은 실제 로직을 써야 하므로 requireActual로 가져옵니다.
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

describe('useCreateTopicMutation', () => {
  const mockCreateTopic = createTopic as jest.Mock;
  const mockToastError = toast.error as jest.Mock;
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // useQueryClient가 호출되면 우리가 만든 스파이 함수(mockInvalidateQueries)를 가진 객체를 반환하도록 설정
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  test('토픽 생성 성공 시 API를 호출하고 쿼리를 무효화해야 한다', async () => {
    // Given: API가 성공한다고 가정
    const mockData = { id: 1, title: 'New Topic' };
    mockCreateTopic.mockResolvedValue(mockData);

    const { result } = renderHook(() => useCreateTopicMutation());

    // When: 뮤테이션 실행 (act로 감싸야 함)
    act(() => {
      result.current.mutate({ title: '새 토픽', projectId: 'proj-123' });
    });

    // Then: 성공 상태가 될 때까지 기다림
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 1. API가 올바른 인자로 호출되었는지 확인
    expect(mockCreateTopic).toHaveBeenCalledWith('새 토픽', 'proj-123');

    // 2. invalidateQueries가 정확한 키로 호출되었는지 확인
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['topics'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['project'] });
  });

  test('토픽 생성 실패 시 에러 토스트를 띄워야 한다', async () => {
    // Given: API가 실패한다고 가정
    const errorMessage = '이미 존재하는 이름입니다.';
    mockCreateTopic.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCreateTopicMutation());

    // When
    act(() => {
      result.current.mutate({ title: '중복 토픽', projectId: 'proj-123' });
    });

    // Then: 에러 상태가 될 때까지 기다림
    await waitFor(() => expect(result.current.isError).toBe(true));

    // 1. Toast 에러 메시지가 호출되었는지 확인
    expect(mockToastError).toHaveBeenCalledWith(errorMessage);

    // 2. 실패했을 때는 쿼리 무효화가 일어나지 않아야 함
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  test('에러 메시지가 없는 경우 기본 메시지를 띄워야 한다', async () => {
    // Given: 메시지 없는 에러 객체
    mockCreateTopic.mockRejectedValue(new Error(''));

    const { result } = renderHook(() => useCreateTopicMutation());

    act(() => {
      result.current.mutate({ title: '테스트', projectId: '1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // 기본 메시지 확인 ('토픽 생성에 실패했습니다.')
    expect(mockToastError).toHaveBeenCalledWith('토픽 생성에 실패했습니다.');
  });
});

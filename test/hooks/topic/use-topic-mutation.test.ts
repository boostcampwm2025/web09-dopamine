/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useCreateTopicMutation, useUpdateTopicTitleMutation } from '@/hooks';
import { createTopic, updateTopicTitle } from '@/lib/api/topic';
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

describe('useTopicMutation', () => {
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

  describe('useUpdateTopicMutation', () => {
    const topicId = 'topic-123';
    const mockUpdateTopicTitle = updateTopicTitle as jest.Mock;
    const mockToastSuccess = toast.success as jest.Mock;
    const mockToastError = toast.error as jest.Mock;

    // QueryClient Spy 설정
    const mockQueryClient = {
      invalidateQueries: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);

      // console.error 모킹 (테스트 로그 오염 방지)
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    test('성공 시 토픽 제목을 수정하고 해당 토픽의 캐시를 무효화해야 한다', async () => {
      // Given
      const updateData = { title: '수정된 토픽명', userId: 'user-1' };
      mockUpdateTopicTitle.mockResolvedValue({ id: topicId, title: updateData.title });

      const { result } = renderHook(() => useUpdateTopicTitleMutation(topicId));

      // When
      act(() => {
        result.current.mutate(updateData);
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // API 호출 확인: topicId와 함께 전달된 데이터 확인
      expect(mockUpdateTopicTitle).toHaveBeenCalledWith(
        topicId,
        updateData.title,
        updateData.userId,
      );

      // 캐시 무효화 확인: 작성하신 ['topics', topicId] 키가 호출되어야 함
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['topics', topicId],
      });

      // 성공 토스트 확인
      expect(mockToastSuccess).toHaveBeenCalledWith('토픽을 수정했습니다!');
    });

    test('실패 시 에러 토스트를 띄우고 콘솔에 에러를 기록해야 한다', async () => {
      // Given
      const error = new Error('네트워크 오류');
      mockUpdateTopicTitle.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateTopicTitleMutation(topicId));

      // When
      act(() => {
        result.current.mutate({ title: '실패 테스트', userId: 'user-1' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));

      // 에러 피드백 확인
      expect(mockToastError).toHaveBeenCalledWith('네트워크 오류');
      expect(console.error).toHaveBeenCalledWith('토픽 수정 실패:', error);
    });

    test('에러 메시지가 없을 경우 기본 에러 메시지를 띄워야 한다', async () => {
      // Given: 메시지가 없는 에러
      mockUpdateTopicTitle.mockRejectedValue(new Error());

      const { result } = renderHook(() => useUpdateTopicTitleMutation(topicId));

      // When
      act(() => {
        result.current.mutate({ title: '실패 테스트', userId: 'user-1' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('토픽 수정에 실패했습니다.');
    });
  });
});

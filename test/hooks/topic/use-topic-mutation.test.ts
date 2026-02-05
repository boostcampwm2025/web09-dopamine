/**
 * @jest-environment jsdom
 */
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  useCreateTopicMutation,
  useDeleteTopicMutation,
  useUpdateTopicTitleMutation,
} from '@/hooks';
import * as topicApi from '@/lib/api/topic';
import { act, renderHook, waitFor } from '../../utils/test-utils';

jest.mock('@/lib/api/topic');
jest.mock('react-hot-toast');
jest.mock('next/navigation');
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return { ...original, useQueryClient: jest.fn() };
});

describe('useTopicMutation', () => {
  const mockRouter = { push: jest.fn() };
  const mockQueryClient = {
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    cancelQueries: jest.fn(),
    removeQueries: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('useCreateTopicMutation', () => {
    const mockCreateTopic = topicApi.createTopic as jest.Mock;

    test('성공 시 setQueryData를 통해 캐시에 토픽을 추가해야 한다 (기존 데이터 있음)', async () => {
      const mockData = { id: 't-1', title: 'New Topic' };
      const projectId = 'p-1';
      mockCreateTopic.mockResolvedValue(mockData);

      const { result } = renderHook(() => useCreateTopicMutation());
      act(() => {
        result.current.mutate({ title: 'New Topic', projectId });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const updater = mockQueryClient.setQueryData.mock.calls[0][1];
      const prevData = { topics: [{ id: 'old-1', title: 'Old' }] };

      const nextData = updater(prevData);
      expect(nextData.topics).toHaveLength(2);
      expect(nextData.topics[0].id).toBe('t-1');
    });

    test('이미 존재하는 ID일 경우 캐시를 업데이트하지 않아야 한다 (Duplicate Branch)', async () => {
      mockCreateTopic.mockResolvedValue({ id: 't-1', title: 'New' });
      const { result } = renderHook(() => useCreateTopicMutation());
      act(() => {
        result.current.mutate({ title: 'New', projectId: 'p-1' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const updater = mockQueryClient.setQueryData.mock.calls[0][1];
      const prevData = { topics: [{ id: 't-1', title: 'Existing' }] };

      const nextData = updater(prevData);
      expect(nextData).toEqual(prevData); // 변화 없음
    });

    test('기존 캐시 데이터가 없으면(null) 그대로 null을 반환해야 한다 (Null Branch)', async () => {
      mockCreateTopic.mockResolvedValue({ id: 't-1' });
      const { result } = renderHook(() => useCreateTopicMutation());
      act(() => {
        result.current.mutate({ title: 'T', projectId: 'p-1' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const updater = mockQueryClient.setQueryData.mock.calls[0][1];
      expect(updater(null)).toBeNull();
    });

    test('실패 시 에러 메시지가 없으면 기본 메시지를 출력해야 한다 (Error Branch)', async () => {
      mockCreateTopic.mockRejectedValue(new Error('')); // 빈 메시지
      const { result } = renderHook(() => useCreateTopicMutation());
      act(() => {
        result.current.mutate({ title: 'Fail', projectId: '1' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('토픽 생성에 실패했습니다.');
    });
  });

  // --- 2. useUpdateTopicTitleMutation ---
  describe('useUpdateTopicTitleMutation', () => {
    const topicId = 't-1';
    const mockUpdate = topicApi.updateTopicTitle as jest.Mock;

    test('성공 시 토픽 캐시를 무효화하고 성공 토스트를 띄운다', async () => {
      mockUpdate.mockResolvedValue({});
      const { result } = renderHook(() => useUpdateTopicTitleMutation(topicId));
      act(() => {
        result.current.mutate({ title: 'Updated' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['topics', topicId],
      });
      expect(toast.success).toHaveBeenCalledWith('토픽을 수정했습니다!');
    });

    test('실패 시 에러 토스트를 띄운다', async () => {
      mockUpdate.mockRejectedValue(new Error('Update Fail'));
      const { result } = renderHook(() => useUpdateTopicTitleMutation(topicId));
      act(() => {
        result.current.mutate({ title: 'Fail' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Update Fail');
    });
  });

  describe('useDeleteTopicMutation', () => {
    const topicId = 't-1';
    const mockDelete = topicApi.deleteTopic as jest.Mock;

    test('성공 시 캐시를 삭제/무효화하고 프로젝트 페이지로 이동한다', async () => {
      const projectId = 'p-123';
      mockDelete.mockResolvedValue({ projectId });

      const { result } = renderHook(() => useDeleteTopicMutation(topicId));
      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 삭제 프로세스 순서 검증
      expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['topics', topicId] });
      expect(mockQueryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ['topics', topicId] });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['project', projectId],
      });
      expect(mockRouter.push).toHaveBeenCalledWith(`/project/${projectId}`);
      expect(toast.success).toHaveBeenCalledWith('토픽이 삭제되었습니다.');
    });

    test('실패 시 기본 에러 메시지를 띄우고 페이지를 이동하지 않는다', async () => {
      mockDelete.mockRejectedValue(new Error(''));
      const { result } = renderHook(() => useDeleteTopicMutation(topicId));
      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('토픽 삭제에 실패했습니다.');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});

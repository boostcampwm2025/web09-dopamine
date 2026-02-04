/**
 * @jest-environment jsdom
 */
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { ISSUE_STATUS } from '@/constants/issue';
import {
  useCreateIssueInTopicMutation,
  useDeleteIssueMutation,
  useIssueStatusMutations,
  useQuickStartMutation,
  useUpdateIssueTitleMutation,
} from '@/hooks';
import * as issueApi from '@/lib/api/issue';
import * as storage from '@/lib/storage/issue-user-storage';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 모듈 모킹
jest.mock('@/lib/api/issue');
jest.mock('@/lib/storage/issue-user-storage');
jest.mock('react-hot-toast');
jest.mock('next/navigation');

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
  useSseConnectionStore: jest.fn(),
}));

describe('Issue Mutations', () => {
  const issueId = 'issue-123';
  const connectionId = 'conn-1';

  // Mock 함수들
  const mockCreateQuickIssue = issueApi.createQuickIssue as jest.Mock;
  const mockUpdateIssueTitle = issueApi.updateIssueTitle as jest.Mock;
  const mockDeleteIssue = issueApi.deleteIssue as jest.Mock;
  const mockUpdateIssueStatus = issueApi.updateIssueStatus as jest.Mock;
  const mockCreateIssueInTopic = issueApi.createIssueInTopic as jest.Mock;
  const mockSetUserIdForIssue = storage.setUserIdForIssue as jest.Mock;
  const mockToastError = toast.error as jest.Mock;
  const mockToastSuccess = toast.success as jest.Mock;

  // QueryClient & Router Spy
  const mockQueryClient = {
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
    cancelQueries: jest.fn(),
    invalidateQueries: jest.fn(),
    removeQueries: jest.fn(),
  };
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: { [issueId]: connectionId },
      });
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. 빠른 시작 (Quick Start)
  describe('useQuickStartMutation', () => {
    test('성공 시 이슈를 생성하고 유저 ID를 스토리지에 저장해야 한다', async () => {
      const newIssue = { issueId: 'issue-1', userId: 'user-1' };
      mockCreateQuickIssue.mockResolvedValue(newIssue);
      const { result } = renderHook(() => useQuickStartMutation());
      act(() => {
        result.current.mutate({ title: 'Quick', nickname: 'User' });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreateQuickIssue).toHaveBeenCalledWith('Quick', 'User');
      expect(mockSetUserIdForIssue).toHaveBeenCalledWith('issue-1', 'user-1');
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      mockCreateQuickIssue.mockRejectedValue(new Error('Fail'));
      const { result } = renderHook(() => useQuickStartMutation());
      act(() => {
        result.current.mutate({ title: 'Quick', nickname: 'User' });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('Fail');
    });
  });

  // 2. 이슈 상태 관리 (Status Update & Next Step)
  describe('useIssueStatusMutations', () => {
    const queryKey = ['issues', issueId];

    describe('handleNextStep (다음 단계 이동)', () => {
      test('BRAINSTORMING 상태에서 다음 단계인 CATEGORIZE로 업데이트해야 한다', async () => {
        mockQueryClient.getQueryData.mockReturnValue({
          id: issueId,
          status: ISSUE_STATUS.BRAINSTORMING,
        });
        mockUpdateIssueStatus.mockResolvedValue({});
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.nextStep();
        });
        await waitFor(() => {
          expect(mockUpdateIssueStatus).toHaveBeenCalledWith(
            issueId,
            ISSUE_STATUS.CATEGORIZE,
            undefined,
            undefined,
            connectionId,
          );
        });
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          queryKey,
          expect.objectContaining({ status: ISSUE_STATUS.CATEGORIZE }),
        );
      });

      test('VOTE 상태에서 다음 단계인 SELECT로 업데이트해야 한다', async () => {
        mockQueryClient.getQueryData.mockReturnValue({ id: issueId, status: ISSUE_STATUS.VOTE });
        mockUpdateIssueStatus.mockResolvedValue({});
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.nextStep();
        });
        await waitFor(() => {
          expect(mockUpdateIssueStatus).toHaveBeenCalledWith(
            issueId,
            ISSUE_STATUS.SELECT,
            undefined,
            undefined,
            connectionId,
          );
        });
      });

      test('캐시된 이슈 정보가 없으면 아무 동작도 하지 않아야 한다', () => {
        mockQueryClient.getQueryData.mockReturnValue(undefined);
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.nextStep();
        });
        expect(mockUpdateIssueStatus).not.toHaveBeenCalled();
      });

      test('마지막 단계이거나 다음 단계가 없으면 상태 업데이트를 하지 않아야 한다', () => {
        mockQueryClient.getQueryData.mockReturnValue({ id: issueId, status: ISSUE_STATUS.CLOSE });
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.nextStep();
        });
        expect(mockUpdateIssueStatus).not.toHaveBeenCalled();
      });
    });

    describe('update (낙관적 업데이트)', () => {
      test('실패 시 이전 상태로 롤백해야 한다', async () => {
        const prevData = { id: issueId, status: ISSUE_STATUS.BRAINSTORMING };
        mockQueryClient.getQueryData.mockReturnValue(prevData);
        mockUpdateIssueStatus.mockRejectedValue(new Error('Update Fail'));
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.nextStep();
        });
        await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Update Fail'));
        expect(mockQueryClient.setQueryData).toHaveBeenLastCalledWith(queryKey, prevData);
      });
    });

    describe('close (이슈 종료)', () => {
      test('성공 시 이슈를 CLOSE 상태로 만들고 성공 토스트를 띄워야 한다', async () => {
        mockUpdateIssueStatus.mockResolvedValue({});
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.close.mutate();
        });
        await waitFor(() => expect(result.current.close.isSuccess).toBe(true));
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey });
        expect(mockToastSuccess).toHaveBeenCalledWith('이슈가 종료되었습니다.');
      });
    });

    describe('Edge Cases (데이터 불일치 상황)', () => {
      test('onMutate 시점에 캐시가 사라지면 낙관적 업데이트를 수행하지 않아야 한다', async () => {
        mockQueryClient.getQueryData.mockReturnValueOnce({
          id: issueId,
          status: ISSUE_STATUS.BRAINSTORMING,
        });
        mockQueryClient.getQueryData.mockReturnValueOnce(undefined);
        mockUpdateIssueStatus.mockResolvedValue({});
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.nextStep();
        });
        await waitFor(() => expect(mockUpdateIssueStatus).toHaveBeenCalled());
        expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
      });

      test('onMutate 시점에 데이터가 없어 Context가 비어있다면 실패 시 롤백하지 않아야 한다', async () => {
        mockQueryClient.getQueryData.mockReturnValueOnce({
          id: issueId,
          status: ISSUE_STATUS.BRAINSTORMING,
        });
        mockQueryClient.getQueryData.mockReturnValueOnce(undefined);
        mockUpdateIssueStatus.mockRejectedValue(new Error('Fail'));
        const { result } = renderHook(() => useIssueStatusMutations(issueId));
        act(() => {
          result.current.nextStep();
        });
        await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Fail'));
        expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
      });
    });
  });

  // 3. 토픽 내 이슈 생성
  describe('useCreateIssueInTopicMutation', () => {
    test('성공 시 토픽의 이슈 목록 캐시를 무효화해야 한다', async () => {
      mockCreateIssueInTopic.mockResolvedValue({});
      const { result } = renderHook(() => useCreateIssueInTopicMutation());
      const topicId = 'topic-123';
      act(() => {
        result.current.mutate({ topicId, title: 'Topic Issue' });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['topics', topicId, 'issues'],
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('이슈가 생성되었습니다!');
    });

    test('토픽 이슈 생성 실패 시 에러 메시지가 없으면 기본 메시지를 띄워야 한다', async () => {
      const error = new Error();
      error.message = '';
      mockCreateIssueInTopic.mockRejectedValue(error);
      const { result } = renderHook(() => useCreateIssueInTopicMutation());
      act(() => {
        result.current.mutate({ topicId: 't-1', title: 'Title' });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('이슈 생성에 실패했습니다.');
    });
  });

  // 4. 이슈 제목 수정
  describe('useUpdateIssueTitleMutation', () => {
    test('성공 시 userId 없이 제목과 connectionId만으로 API를 호출해야 한다', async () => {
      mockUpdateIssueTitle.mockResolvedValue({});
      const { result } = renderHook(() => useUpdateIssueTitleMutation(issueId));
      act(() => {
        result.current.mutate({ title: 'New Title', connectionId });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockUpdateIssueTitle).toHaveBeenCalledWith(issueId, 'New Title', connectionId);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['issues', issueId],
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('이슈를 수정했습니다!');
    });

    test('실패 시 에러 메시지를 토스트로 보여줘야 한다', async () => {
      mockUpdateIssueTitle.mockRejectedValue(new Error('Update Failed'));
      const { result } = renderHook(() => useUpdateIssueTitleMutation(issueId));
      act(() => {
        result.current.mutate({ title: 'Fail', connectionId });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('Update Failed');
    });
  });

  // 5. 이슈 삭제
  describe('useDeleteIssueMutation', () => {
    test('성공 시 캐시를 제거하고 해당 토픽 페이지로 이동해야 한다', async () => {
      const topicId = 'topic-456';
      mockDeleteIssue.mockResolvedValue({ topicId });
      const { result } = renderHook(() => useDeleteIssueMutation(issueId));
      act(() => {
        result.current.mutate({ connectionId });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey: ['issues', issueId] });
      expect(mockQueryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ['issues', issueId] });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['topics', topicId],
      });
      expect(mockRouter.push).toHaveBeenCalledWith(`/topic/${topicId}`);
      expect(mockToastSuccess).toHaveBeenCalledWith('이슈를 삭제했습니다.');
    });

    test('삭제 성공 후 topicId가 없다면 루트 페이지로 이동해야 한다', async () => {
      mockDeleteIssue.mockResolvedValue({ topicId: null });
      const { result } = renderHook(() => useDeleteIssueMutation(issueId));
      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      mockDeleteIssue.mockRejectedValue(new Error('Delete Fail'));
      const { result } = renderHook(() => useDeleteIssueMutation(issueId));
      act(() => {
        result.current.mutate({});
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('Delete Fail');
    });
  });
});

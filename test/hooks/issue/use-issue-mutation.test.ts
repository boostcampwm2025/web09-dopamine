/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ISSUE_STATUS } from '@/constants/issue';
import {
  useCreateIssueInTopicMutation,
  useIssueStatusMutations,
  useQuickStartMutation,
} from '@/hooks';
import * as issueApi from '@/lib/api/issue';
import * as storage from '@/lib/storage/issue-user-storage';
import { act, renderHook, waitFor } from '../../utils/test-utils';

// 1. 외부 모듈 모킹
jest.mock('@/lib/api/issue');
jest.mock('@/lib/storage/issue-user-storage');
jest.mock('react-hot-toast');

// @/constants/issue는 모킹하지 않고 실제 값을 사용합니다.
// 그래야 실제 비즈니스 로직(STEP_FLOW 순서)이 맞는지 검증할 수 있습니다.

// 2. React Query 모킹
jest.mock('@tanstack/react-query', () => {
  const original = jest.requireActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: jest.fn(),
  };
});

describe('Issue Mutations', () => {
  // Mock 함수들
  const mockCreateQuickIssue = issueApi.createQuickIssue as jest.Mock;
  const mockUpdateIssueStatus = issueApi.updateIssueStatus as jest.Mock;
  const mockCreateIssueInTopic = issueApi.createIssueInTopic as jest.Mock;
  const mockSetUserIdForIssue = storage.setUserIdForIssue as jest.Mock;
  const mockToastError = toast.error as jest.Mock;
  const mockToastSuccess = toast.success as jest.Mock;

  // QueryClient Spy
  const mockQueryClient = {
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
    cancelQueries: jest.fn(),
    invalidateQueries: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  // 1. 빠른 시작 (Quick Start)
  describe('useQuickStartMutation', () => {
    test('성공 시 이슈를 생성하고 유저 ID를 스토리지에 저장해야 한다', async () => {
      // Given
      const newIssue = { issueId: 'issue-1', userId: 'user-1' };
      mockCreateQuickIssue.mockResolvedValue(newIssue);

      const { result } = renderHook(() => useQuickStartMutation());

      // When
      act(() => {
        result.current.mutate({ title: 'Quick', nickname: 'User' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCreateQuickIssue).toHaveBeenCalledWith('Quick', 'User');
      expect(mockSetUserIdForIssue).toHaveBeenCalledWith('issue-1', 'user-1');
    });

    test('실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      mockCreateQuickIssue.mockRejectedValue(new Error('Fail'));
      const { result } = renderHook(() => useQuickStartMutation());

      // When
      act(() => {
        result.current.mutate({ title: 'Quick', nickname: 'User' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('Fail');
    });
  });

  // 2. 이슈 상태 관리 (Status Update & Next Step)
  describe('useIssueStatusMutations', () => {
    const issueId = 'issue-123';
    const queryKey = ['issues', issueId];

    describe('handleNextStep (다음 단계 이동)', () => {
      test('BRAINSTORMING 상태에서 다음 단계인 CATEGORIZE로 업데이트해야 한다', async () => {
        // Given: 현재 상태가 BRAINSTORMING (STEP_FLOW의 첫 번째)
        mockQueryClient.getQueryData.mockReturnValue({
          id: issueId,
          status: ISSUE_STATUS.BRAINSTORMING,
        });
        mockUpdateIssueStatus.mockResolvedValue({});

        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When
        act(() => {
          result.current.nextStep();
        });

        // Then
        // STEP_FLOW: [BRAINSTORMING, CATEGORIZE, VOTE, SELECT, CLOSE]
        // 따라서 다음 단계는 CATEGORIZE여야 함
        await waitFor(() => {
          expect(mockUpdateIssueStatus).toHaveBeenCalledWith(issueId, ISSUE_STATUS.CATEGORIZE);
        });

        // 낙관적 업데이트 확인
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
          queryKey,
          expect.objectContaining({ status: ISSUE_STATUS.CATEGORIZE }),
        );
      });

      test('VOTE 상태에서 다음 단계인 SELECT로 업데이트해야 한다', async () => {
        // Given
        mockQueryClient.getQueryData.mockReturnValue({
          id: issueId,
          status: ISSUE_STATUS.VOTE,
        });
        mockUpdateIssueStatus.mockResolvedValue({});

        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When
        act(() => {
          result.current.nextStep();
        });

        // Then
        await waitFor(() => {
          expect(mockUpdateIssueStatus).toHaveBeenCalledWith(issueId, ISSUE_STATUS.SELECT);
        });
      });

      test('캐시된 이슈 정보가 없으면 아무 동작도 하지 않아야 한다', () => {
        // Given
        mockQueryClient.getQueryData.mockReturnValue(undefined);

        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When
        act(() => {
          result.current.nextStep();
        });

        // Then
        expect(mockUpdateIssueStatus).not.toHaveBeenCalled();
      });
    });

    describe('update (낙관적 업데이트)', () => {
      test('실패 시 이전 상태로 롤백해야 한다', async () => {
        // Given
        const prevData = { id: issueId, status: ISSUE_STATUS.BRAINSTORMING };
        mockQueryClient.getQueryData.mockReturnValue(prevData);
        mockUpdateIssueStatus.mockRejectedValue(new Error('Update Fail'));

        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When: nextStep 호출
        act(() => {
          result.current.nextStep();
        });

        // Then
        await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Update Fail'));

        // 롤백 확인
        expect(mockQueryClient.setQueryData).toHaveBeenLastCalledWith(queryKey, prevData);
      });
    });

    describe('close (이슈 종료)', () => {
      test('성공 시 이슈를 CLOSE 상태로 만들고 성공 토스트를 띄워야 한다', async () => {
        // Given
        mockUpdateIssueStatus.mockResolvedValue({});
        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When
        act(() => {
          result.current.close.mutate();
        });

        // Then
        await waitFor(() => expect(result.current.close.isSuccess).toBe(true));

        expect(mockUpdateIssueStatus).toHaveBeenCalledWith(issueId, ISSUE_STATUS.CLOSE);
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey });
        expect(mockToastSuccess).toHaveBeenCalledWith('이슈가 종료되었습니다.');
      });
    });
  });

  // 3. 토픽 내 이슈 생성
  describe('useCreateIssueInTopicMutation', () => {
    test('성공 시 토픽의 이슈 목록 캐시를 무효화해야 한다', async () => {
      // Given
      mockCreateIssueInTopic.mockResolvedValue({});
      const { result } = renderHook(() => useCreateIssueInTopicMutation());
      const topicId = 'topic-123';

      // When
      act(() => {
        result.current.mutate({ topicId, title: 'Topic Issue' });
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCreateIssueInTopic).toHaveBeenCalledWith(topicId, 'Topic Issue');

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['topics', topicId, 'issues'],
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('이슈가 생성되었습니다!');
    });
  });
});

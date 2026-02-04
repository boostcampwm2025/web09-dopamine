/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { ISSUE_STATUS } from '@/constants/issue';
import {
  useCreateIssueInTopicMutation,
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

describe('Issue Mutations', () => {
  const issueId = 'issue-123';
  const connectionId = 'conn-1'; // 테스트용 connectionId

  // Mock 함수들
  const mockCreateQuickIssue = issueApi.createQuickIssue as jest.Mock;
  const mockUpdateIssueTitle = issueApi.updateIssueTitle as jest.Mock;
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

    // Store 구현 주입: 특정 issueId에 대해 connectionId 반환
    // (mockImplementation을 사용하여 호출 시점에 값을 반환하도록 설정)
    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: {
          [issueId]: connectionId,
        },
      });
    });

    // console.error 모킹 (테스트 로그 오염 방지)
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    const queryKey = ['issues', issueId];

    describe('handleNextStep (다음 단계 이동)', () => {
      test('BRAINSTORMING 상태에서 다음 단계인 CATEGORIZE로 업데이트해야 한다', async () => {
        // Given
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
        // 5개의 인자를 모두 확인 (issueId, status, undefined, undefined, connectionId)
        await waitFor(() => {
          expect(mockUpdateIssueStatus).toHaveBeenCalledWith(
            issueId,
            ISSUE_STATUS.CATEGORIZE,
            undefined,
            undefined,
            connectionId, // 여기가 undefined가 아니어야 함
          );
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
        // 5개의 인자 확인
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

      test('마지막 단계이거나 다음 단계가 없으면 상태 업데이트를 하지 않아야 한다', () => {
        // Given: 마지막 단계인 CLOSE 상태
        mockQueryClient.getQueryData.mockReturnValue({
          id: issueId,
          status: ISSUE_STATUS.CLOSE,
        });

        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When
        act(() => {
          result.current.nextStep();
        });

        // Then: API 호출이 일어나지 않아야 함
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

        // When: nextStep 호출 (API 호출 유발)
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

        // 5개의 인자 확인
        expect(mockUpdateIssueStatus).toHaveBeenCalledWith(
          issueId,
          ISSUE_STATUS.CLOSE,
          undefined,
          undefined,
          connectionId,
        );
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey });
        expect(mockToastSuccess).toHaveBeenCalledWith('이슈가 종료되었습니다.');
      });
    });

    describe('Edge Cases (데이터 불일치 상황)', () => {
      test('onMutate 시점에 캐시가 사라지면(undefined) 낙관적 업데이트를 수행하지 않아야 한다', async () => {
        // Given
        // 1. handleNextStep 호출 시점: 데이터 있음 (진입 성공)
        mockQueryClient.getQueryData.mockReturnValueOnce({
          id: issueId,
          status: ISSUE_STATUS.BRAINSTORMING,
        });

        // 2. onMutate 내부 호출 시점: 데이터 사라짐 (Cache Miss 시뮬레이션)
        // 이렇게 하면 onMutate 내부의 if (previousIssue) 블록을 건너뜁니다.
        mockQueryClient.getQueryData.mockReturnValueOnce(undefined);

        mockUpdateIssueStatus.mockResolvedValue({});

        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When
        act(() => {
          result.current.nextStep();
        });

        // Then
        // update API는 정상적으로 호출되어야 함
        await waitFor(() => {
          expect(mockUpdateIssueStatus).toHaveBeenCalled();
        });

        // 하지만 onMutate 내부의 setQueryData(낙관적 업데이트)는 호출되지 않아야 함
        expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
      });

      test('onMutate 시점에 데이터가 없어 Context가 비어있다면, 실패 시 롤백하지 않아야 한다', async () => {
        // Given
        // 1. handleNextStep용 데이터 (성공)
        mockQueryClient.getQueryData.mockReturnValueOnce({
          id: issueId,
          status: ISSUE_STATUS.BRAINSTORMING,
        });

        // 2. onMutate용 데이터 (없음) -> context.previousIssue가 undefined가 됨
        mockQueryClient.getQueryData.mockReturnValueOnce(undefined);

        mockUpdateIssueStatus.mockRejectedValue(new Error('Fail'));

        const { result } = renderHook(() => useIssueStatusMutations(issueId));

        // When
        act(() => {
          result.current.nextStep();
        });

        // Then
        await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Fail'));

        // Context가 없으므로 롤백(setQueryData)이 실행되지 않아야 함
        expect(mockQueryClient.setQueryData).not.toHaveBeenCalled();
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

    test('토픽 이슈 생성 실패 시 에러 메시지가 없으면 기본 메시지를 띄워야 한다', async () => {
      // Given: 메시지 없는 에러 객체
      const error = new Error();
      error.message = ''; // 강제로 비움
      mockCreateIssueInTopic.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateIssueInTopicMutation());

      // When
      act(() => {
        result.current.mutate({ topicId: 't-1', title: 'Title' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('이슈 생성에 실패했습니다.');
    });
  });
  // 4. 이슈 제목 수정
  describe('useUpdateIssueTitleMutation', () => {
    test('성공 시 이슈 상세 캐시를 무효화하고 성공 토스트를 띄워야 한다', async () => {
      // Given
      mockUpdateIssueTitle.mockResolvedValue({});
      const { result } = renderHook(() => useUpdateIssueTitleMutation(issueId));
      const updateData = { title: '수정된 이슈 제목', userId: 'user-999' };

      // When
      act(() => {
        result.current.mutate(updateData);
      });

      // Then
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // API 호출 인자 확인
      expect(mockUpdateIssueTitle).toHaveBeenCalledWith(
        issueId,
        updateData.title,
        updateData.userId,
      );

      // 캐시 무효화 및 토스트 확인
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['issues', issueId],
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('이슈를 수정했습니다!');
    });

    test('수정 실패 시 에러 메시지를 토스트로 띄워야 한다', async () => {
      // Given
      const errorMsg = '권한이 없습니다.';
      mockUpdateIssueTitle.mockRejectedValue(new Error(errorMsg));

      const { result } = renderHook(() => useUpdateIssueTitleMutation(issueId));

      // When
      act(() => {
        result.current.mutate({ title: '실패 테스트', userId: 'wrong-user' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith(errorMsg);
    });

    test('에러 메시지가 없는 실패 상황에서 기본 메시지를 띄워야 한다', async () => {
      // Given: 메시지가 없는 Error 객체
      mockUpdateIssueTitle.mockRejectedValue(new Error());

      const { result } = renderHook(() => useUpdateIssueTitleMutation(issueId));

      // When
      act(() => {
        result.current.mutate({ title: '실패 테스트', userId: 'user-1' });
      });

      // Then
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('이슈 수정에 실패했습니다.');
    });
  });
});

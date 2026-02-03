/**
 * @jest-environment jsdom
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSseConnectionStore } from '@/app/(with-sidebar)/issue/store/use-sse-connection-store';
import { useIssueMemberMutations, useNicknameMutations } from '@/hooks';
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

describe('Issue Member & Nickname Mutations', () => {
  const issueId = 'issue-1';
  const connectionId = 'conn-1'; // 테스트용 connectionId

  // API Mocks
  const mockJoinIssue = issueApi.joinIssue as jest.Mock;
  const mockGenerateNickname = issueApi.generateNickname as jest.Mock;
  // mockCheckNicknameDuplicate는 소스코드에서 삭제되었으므로 제거함

  // Storage & Toast Mocks
  const mockSetUserId = storage.setUserIdForIssue as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  // QueryClient Spy
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    (useSseConnectionStore as unknown as jest.Mock).mockImplementation((selector) => {
      return selector({
        connectionIds: {
          [issueId]: connectionId,
        },
      });
    });

    // console.error 모킹
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. 이슈 참여 테스트
  describe('useIssueMemberMutations', () => {
    test('참여 성공 시 유저 ID를 저장하고 쿼리를 무효화해야 한다', async () => {
      // Given
      const mockResponse = { userId: 'user-new', nickname: 'NewUser' };
      mockJoinIssue.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useIssueMemberMutations(issueId));

      // When
      act(() => {
        result.current.join.mutate('NewUser');
      });

      // Then
      await waitFor(() => expect(result.current.join.isSuccess).toBe(true));

      // 1. API 호출 확인
      expect(mockJoinIssue).toHaveBeenCalledWith(issueId, 'NewUser', connectionId);

      // 2. 스토리지 저장 로직 확인
      expect(mockSetUserId).toHaveBeenCalledWith(issueId, 'user-new');

      // 3. 쿼리 무효화 확인
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['issues', issueId, 'members'],
      });
    });

    test('참여 실패 시 에러 토스트를 띄워야 한다', async () => {
      // Given
      mockJoinIssue.mockRejectedValue(new Error('참여 실패'));
      const { result } = renderHook(() => useIssueMemberMutations(issueId));

      // When
      act(() => {
        result.current.join.mutate('ErrorUser');
      });

      // Then
      await waitFor(() => expect(result.current.join.isError).toBe(true));
      expect(mockToastError).toHaveBeenCalledWith('참여 실패');

      // 실패 시 저장은 안 되어야 함
      expect(mockSetUserId).not.toHaveBeenCalled();
    });
  });

  // 2. 닉네임 생성 테스트
  describe('useNicknameMutations', () => {
    describe('generate (닉네임 생성)', () => {
      test('성공 시 생성된 닉네임을 반환해야 한다', async () => {
        // Given
        const mockNick = { nickname: 'RandomNick' };
        mockGenerateNickname.mockResolvedValue(mockNick);

        const { result } = renderHook(() => useNicknameMutations(issueId));

        // When
        act(() => {
          result.current.generate.mutate();
        });

        // Then
        await waitFor(() => expect(result.current.generate.isSuccess).toBe(true));
        expect(mockGenerateNickname).toHaveBeenCalledWith(issueId);
      });

      test('생성 실패 시 에러 토스트를 띄워야 한다', async () => {
        const error = new Error('생성 실패');
        mockGenerateNickname.mockRejectedValue(error);

        const { result } = renderHook(() => useNicknameMutations(issueId));

        act(() => {
          result.current.generate.mutate();
        });

        await waitFor(() => expect(result.current.generate.isError).toBe(true));
        expect(mockToastError).toHaveBeenCalledWith('생성 실패');
      });
    });
  });
});

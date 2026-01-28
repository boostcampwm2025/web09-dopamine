/**
 * @jest-environment jsdom
 */
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CLIENT_ERROR_MESSAGES } from '@/constants/error-messages';
import { useInvitationMutations } from '@/hooks';
// 실제 경로에 맞게 수정
import * as invitationApi from '@/lib/api/invitation';
import { act, renderHook, waitFor } from '../../utils/ui-test-helpers';

// 1. 외부 의존성 모킹
jest.mock('@/lib/api/invitation');
jest.mock('react-hot-toast');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('useInvitationMutations', () => {
  const projectId = 'proj-123';

  // Mock 함수들
  const mockCreateInvitation = invitationApi.createInvitation as jest.Mock;
  const mockAcceptInvitation = invitationApi.acceptInvitation as jest.Mock;
  const mockPush = jest.fn();
  const mockToastSuccess = toast.success as jest.Mock;
  const mockToastError = toast.error as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // useRouter가 mockPush를 반환하도록 설정
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe('createToken (초대 링크 생성)', () => {
    test('성공 시 API를 호출해야 한다', async () => {
      // Given
      mockCreateInvitation.mockResolvedValue({});
      const { result } = renderHook(() => useInvitationMutations(projectId));
      const emails = ['test@test.com'];

      // When
      act(() => {
        result.current.createToken.mutate(emails);
      });

      // Then
      await waitFor(() => expect(result.current.createToken.isSuccess).toBe(true));
      expect(mockCreateInvitation).toHaveBeenCalledWith(projectId, emails);
    });

    test('실패 시 고정된 에러 메시지를 토스트로 띄워야 한다', async () => {
      // Given
      mockCreateInvitation.mockRejectedValue(new Error('API Error'));
      const { result } = renderHook(() => useInvitationMutations(projectId));

      // When
      act(() => {
        result.current.createToken.mutate(['test@test.com']);
      });

      // Then
      await waitFor(() => expect(result.current.createToken.isError).toBe(true));
      // "초대 링크를 생성할 수 없습니다." 메시지 확인
      expect(mockToastError).toHaveBeenCalledWith('초대 링크를 생성할 수 없습니다.');
    });
  });

  describe('joinProject (초대 수락)', () => {
    const token = 'valid-token';

    test('성공 시 환영 토스트를 띄우고 프로젝트 페이지로 이동해야 한다', async () => {
      // Given
      mockAcceptInvitation.mockResolvedValue({});
      const { result } = renderHook(() => useInvitationMutations(projectId));

      // When
      act(() => {
        result.current.joinProject.mutate(token);
      });

      // Then
      await waitFor(() => expect(result.current.joinProject.isSuccess).toBe(true));

      expect(mockToastSuccess).toHaveBeenCalledWith('프로젝트에 참여합니다!');
      expect(mockPush).toHaveBeenCalledWith(`/project/${projectId}`);
    });

    test('일반 에러 발생 시 에러 메시지를 띄우고 이동하지 않아야 한다', async () => {
      // Given: 일반적인 에러 (예: 만료된 토큰)
      const errorMsg = '유효하지 않은 토큰입니다.';
      mockAcceptInvitation.mockRejectedValue(new Error(errorMsg));

      const { result } = renderHook(() => useInvitationMutations(projectId));

      // When
      act(() => {
        result.current.joinProject.mutate(token);
      });

      // Then
      await waitFor(() => expect(result.current.joinProject.isError).toBe(true));

      expect(mockToastError).toHaveBeenCalledWith(errorMsg);
      // 이동하면 안 됨
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('이미 참여 중(ALREADY_EXISTED) 에러 발생 시 토스트를 띄우고 프로젝트 페이지로 이동해야 한다', async () => {
      // Given: 이미 존재하는 멤버 에러
      const alreadyExistMsg = CLIENT_ERROR_MESSAGES['ALREADY_EXISTED'];
      mockAcceptInvitation.mockRejectedValue(new Error(alreadyExistMsg));

      const { result } = renderHook(() => useInvitationMutations(projectId));

      // When
      act(() => {
        result.current.joinProject.mutate(token);
      });

      // Then
      await waitFor(() => expect(result.current.joinProject.isError).toBe(true));

      // 1. 에러 토스트는 띄움
      expect(mockToastError).toHaveBeenCalledWith(alreadyExistMsg);

      // 2. 중요: 에러 상황이지만 프로젝트 페이지로 이동해야 함 (Redirect)
      expect(mockPush).toHaveBeenCalledWith(`/project/${projectId}`);
    });
  });
});
